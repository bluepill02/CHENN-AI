/**
 * Live Alerts & Info E2E Test Suite
 *
 * Comprehensive end-to-end testing of live alerts and info functionality including:
 * - Live alerts page navigation and interaction
 * - Weather data display and refresh
 * - Location-based filtering
 * - Offline/online mode switching
 * - Alert acknowledgment workflows
 * - Multi-language support (Tamil/English)
 * - Real-time data updates
 */

import { expect, test } from '@playwright/test';

test.describe('Live Alerts & Info System', () => {
  test.beforeEach(async ({ page }) => {
    // Set up mock location
    await page.goto('/');
    
    // Mock geolocation
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'geolocation', {
        value: {
          getCurrentPosition: (success: any) => {
            success({
              coords: {
                latitude: 13.0827,
                longitude: 80.2707,
                accuracy: 100
              }
            });
          },
          watchPosition: () => {},
          clearWatch: () => {}
        },
        writable: true
      });
    });

    // Mock API responses for consistent testing
    await page.route('**/api/weather**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          temperature: 32,
          condition: 'partly_cloudy',
          conditionTamil: 'பகுதியளவு மேகமூட்டம்',
          humidity: 75,
          windSpeed: 12,
          lastUpdated: new Date().toISOString()
        })
      });
    });

    await page.route('**/api/alerts**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'test-alert-1',
            title: 'போக்குவரத்து நெரிசல்',
            titleEn: 'Traffic Alert',
            message: 'அண்ணா சாலையில் கனமான போக்குவரத்து',
            messageEn: 'Heavy traffic on Anna Salai',
            severity: 'medium',
            timestamp: new Date().toISOString(),
            source: 'Traffic Control',
            affectedAreas: ['Anna Salai'],
            pincodes: ['600002'],
            isActive: true
          },
          {
            id: 'test-alert-2',
            title: 'வெப்ப எச்சரிக்கை',
            titleEn: 'Heat Warning',
            message: 'இன்று அதிக வெப்பம் எதிர்பார்க்கப்படுகிறது',
            messageEn: 'High temperature expected today',
            severity: 'low',
            timestamp: new Date().toISOString(),
            source: 'Weather Department',
            affectedAreas: ['Chennai'],
            pincodes: ['600001', '600002'],
            isActive: true
          }
        ])
      });
    });
  });

  test.describe('Navigation and Page Load', () => {
    test('should load live alerts page successfully', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Check page title and header
      await expect(page.locator('h1')).toContainText('Live Alerts');
      
      // Verify page is fully loaded
      await expect(page.locator('[data-testid="alerts-container"]')).toBeVisible();
      
      // Check loading state is resolved
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    });

    test('should load live info page with all sections', async ({ page }) => {
      await page.goto('/live-info');
      
      // Check main sections are present
      await expect(page.locator('[data-testid="weather-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="alerts-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="traffic-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="transport-section"]')).toBeVisible();
    });

    test('should handle navigation between live pages', async ({ page }) => {
      // Start from home
      await page.goto('/');
      
      // Navigate to live alerts
      await page.click('[data-testid="nav-live-alerts"]');
      await expect(page).toHaveURL(/live-alerts/);
      
      // Navigate to live info
      await page.click('[data-testid="nav-live-info"]');
      await expect(page).toHaveURL(/live-info/);
      
      // Back to alerts
      await page.click('[data-testid="nav-live-alerts"]');
      await expect(page).toHaveURL(/live-alerts/);
    });
  });

  test.describe('Live Alerts Functionality', () => {
    test('should display alerts with correct information', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Wait for alerts to load
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(2);
      
      // Check first alert details
      const firstAlert = page.locator('[data-testid="alert-item"]').first();
      await expect(firstAlert.locator('[data-testid="alert-title"]')).toContainText('Traffic Alert');
      await expect(firstAlert.locator('[data-testid="alert-message"]')).toContainText('Heavy traffic');
      await expect(firstAlert.locator('[data-testid="alert-severity"]')).toContainText('medium');
      await expect(firstAlert.locator('[data-testid="alert-source"]')).toContainText('Traffic Control');
    });

    test('should allow alert acknowledgment', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Mock acknowledgment API
      await page.route('**/api/alerts/*/acknowledge', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-alert-1',
            acknowledged: true,
            acknowledgedAt: new Date().toISOString()
          })
        });
      });
      
      // Find and click acknowledge button
      const firstAlert = page.locator('[data-testid="alert-item"]').first();
      await firstAlert.locator('[data-testid="acknowledge-button"]').click();
      
      // Verify acknowledgment feedback
      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Alert acknowledged');
      
      // Check alert is marked as acknowledged
      await expect(firstAlert.locator('[data-testid="alert-acknowledged"]')).toBeVisible();
    });

    test('should filter alerts by severity', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Wait for alerts to load
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(2);
      
      // Filter by high severity
      await page.selectOption('[data-testid="severity-filter"]', 'high');
      
      // Should show no alerts (our test alerts are medium and low)
      await expect(page.locator('[data-testid="no-alerts-message"]')).toBeVisible();
      
      // Filter by medium severity
      await page.selectOption('[data-testid="severity-filter"]', 'medium');
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(1);
      
      // Clear filter
      await page.selectOption('[data-testid="severity-filter"]', 'all');
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(2);
    });

    test('should refresh alerts manually', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Wait for initial load
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(2);
      
      // Click refresh button
      await page.click('[data-testid="refresh-button"]');
      
      // Should show loading state briefly
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
      
      // Should complete refresh
      await expect(page.locator('[data-testid="loading-indicator"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="last-updated"]')).toContainText('just now');
    });
  });

  test.describe('Weather Integration', () => {
    test('should display current weather information', async ({ page }) => {
      await page.goto('/live-info');
      
      const weatherSection = page.locator('[data-testid="weather-section"]');
      
      // Check weather data is displayed
      await expect(weatherSection.locator('[data-testid="temperature"]')).toContainText('32°C');
      await expect(weatherSection.locator('[data-testid="condition"]')).toContainText('Partly Cloudy');
      await expect(weatherSection.locator('[data-testid="humidity"]')).toContainText('75%');
      await expect(weatherSection.locator('[data-testid="wind-speed"]')).toContainText('12 km/h');
    });

    test('should handle weather API failure gracefully', async ({ page }) => {
      // Mock API failure
      await page.route('**/api/weather**', async (route) => {
        await route.fulfill({ status: 500 });
      });
      
      await page.goto('/live-info');
      
      const weatherSection = page.locator('[data-testid="weather-section"]');
      
      // Should show fallback/error state
      await expect(weatherSection.locator('[data-testid="weather-error"]')).toContainText('Unable to load weather');
      
      // Should have refresh option
      await expect(weatherSection.locator('[data-testid="weather-retry"]')).toBeVisible();
    });

    test('should refresh weather data', async ({ page }) => {
      await page.goto('/live-info');
      
      const weatherSection = page.locator('[data-testid="weather-section"]');
      
      // Click weather refresh
      await weatherSection.locator('[data-testid="weather-refresh"]').click();
      
      // Should show loading state
      await expect(weatherSection.locator('[data-testid="weather-loading"]')).toBeVisible();
      
      // Should complete refresh
      await expect(weatherSection.locator('[data-testid="weather-loading"]')).not.toBeVisible();
      await expect(weatherSection.locator('[data-testid="weather-updated"]')).toContainText('Updated');
    });
  });

  test.describe('Language Support', () => {
    test('should toggle between English and Tamil', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Default should be English
      await expect(page.locator('h1')).toContainText('Live Alerts');
      
      // Switch to Tamil
      await page.click('[data-testid="language-toggle"]');
      
      // Should show Tamil text
      await expect(page.locator('h1')).toContainText('நேரடி எச்சரிக்கைகள்');
      
      // Alert content should also be in Tamil
      const firstAlert = page.locator('[data-testid="alert-item"]').first();
      await expect(firstAlert.locator('[data-testid="alert-title"]')).toContainText('போக்குவரத்து நெரிசல்');
      
      // Switch back to English
      await page.click('[data-testid="language-toggle"]');
      await expect(page.locator('h1')).toContainText('Live Alerts');
    });

    test('should maintain language preference across pages', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Switch to Tamil
      await page.click('[data-testid="language-toggle"]');
      await expect(page.locator('h1')).toContainText('நேரடி எச்சரிக்கைகள்');
      
      // Navigate to live info
      await page.goto('/live-info');
      
      // Should still be in Tamil
      await expect(page.locator('h1')).toContainText('நேரடி தகவல்');
    });
  });

  test.describe('Location-Based Features', () => {
    test('should filter content by pincode', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Set pincode
      await page.fill('[data-testid="pincode-input"]', '600002');
      await page.click('[data-testid="pincode-submit"]');
      
      // Should filter alerts for this pincode
      await expect(page.locator('[data-testid="location-indicator"]')).toContainText('600002');
      
      // Should show relevant alerts
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(2); // Both test alerts are for 600002
    });

    test('should handle location detection', async ({ page }) => {
      await page.goto('/live-info');
      
      // Should detect location automatically
      await expect(page.locator('[data-testid="location-detected"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-location"]')).toContainText('Chennai');
    });

    test('should allow manual location change', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Open location selector
      await page.click('[data-testid="change-location"]');
      
      // Select different area
      await page.selectOption('[data-testid="area-select"]', 'T. Nagar');
      await page.click('[data-testid="location-confirm"]');
      
      // Should update location context
      await expect(page.locator('[data-testid="current-area"]')).toContainText('T. Nagar');
    });
  });

  test.describe('Offline/Online Behavior', () => {
    test('should handle offline mode gracefully', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Wait for initial load
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(2);
      
      // Go offline
      await page.context().setOffline(true);
      
      // Try to refresh
      await page.click('[data-testid="refresh-button"]');
      
      // Should show offline message
      await expect(page.locator('[data-testid="offline-notice"]')).toContainText('offline');
      
      // Should still show cached alerts
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(2);
    });

    test('should sync when coming back online', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Go offline
      await page.context().setOffline(true);
      
      // Submit an alert report offline
      await page.click('[data-testid="report-alert"]');
      await page.fill('[data-testid="alert-title-input"]', 'Offline Report');
      await page.fill('[data-testid="alert-message-input"]', 'Reported while offline');
      await page.click('[data-testid="submit-report"]');
      
      // Should show queued message
      await expect(page.locator('[data-testid="queued-notice"]')).toContainText('queued');
      
      // Come back online
      await page.context().setOffline(false);
      
      // Should sync automatically
      await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="queued-count"]')).toContainText('0');
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load quickly and be responsive', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/live-alerts');
      
      // Should load within reasonable time
      await expect(page.locator('[data-testid="alerts-container"]')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 seconds max
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Navigate with keyboard
      await page.keyboard.press('Tab'); // Should focus first interactive element
      await page.keyboard.press('Tab'); // Next element
      
      // Should be able to interact with alerts using keyboard
      await page.keyboard.press('Enter');
      
      // Should show alert details or acknowledgment
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Check for accessibility attributes
      await expect(page.locator('[data-testid="alerts-container"]')).toHaveAttribute('role', 'main');
      await expect(page.locator('[data-testid="alert-item"]').first()).toHaveAttribute('role', 'article');
      await expect(page.locator('[data-testid="acknowledge-button"]').first()).toHaveAttribute('aria-label');
    });
  });

  test.describe('Real-time Updates', () => {
    test('should update alerts in real-time', async ({ page }) => {
      await page.goto('/live-alerts');
      
      // Initial state
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(2);
      
      // Simulate new alert via WebSocket or polling
      await page.evaluate(() => {
        // Simulate real-time update
        window.dispatchEvent(new CustomEvent('newAlert', {
          detail: {
            id: 'realtime-alert',
            title: 'New Emergency',
            titleEn: 'New Emergency',
            message: 'Breaking news alert',
            messageEn: 'Breaking news alert',
            severity: 'high',
            timestamp: new Date().toISOString(),
            source: 'Emergency Services',
            isActive: true
          }
        }));
      });
      
      // Should show new alert
      await expect(page.locator('[data-testid="alert-item"]')).toHaveCount(3);
      
      // Should show notification
      await expect(page.locator('[data-testid="new-alert-notification"]')).toBeVisible();
    });

    test('should auto-refresh data periodically', async ({ page }) => {
      await page.goto('/live-info');
      
      // Track initial update time
      const initialTime = await page.locator('[data-testid="last-updated"]').textContent();
      
      // Wait for auto-refresh (mock faster interval for testing)
      await page.evaluate(() => {
        // Force refresh cycle
        window.dispatchEvent(new CustomEvent('forceRefresh'));
      });
      
      // Should update timestamp
      await expect(page.locator('[data-testid="last-updated"]')).not.toContainText(initialTime || '');
    });
  });
});