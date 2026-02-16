---
description: How to add new Chennai-themed icons to the design system
---

# Adding New Chennai-Themed Icons

1.  **Design the Icon**:
    -   Create an SVG icon that represents a Chennai-specific concept (e.g., specific food items, landmarks, cultural symbols).
    -   Ensure the SVG is clean and optimized.

2.  **Add to `ChennaiCustomIcons` in `components/CustomIcons.tsx`**:
    -   Define a new component within the `ChennaiCustomIcons` object.
    -   Use `framer-motion`'s `motion.path` or `motion.g` for animations.
    -   Accept `className` and `color` props.
    -   Example:
        ```tsx
        NewIcon: ({ className = "w-6 h-6", color = "currentColor" }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path d="..." fill={color} initial={{...}} animate={{...}} />
            </svg>
        ),
        ```

3.  **Update `CustomIconProps`**:
    -   The `CustomIcon` component automatically infers keys from `ChennaiCustomIcons`, so no manual type update is needed if you use `keyof typeof ChennaiCustomIcons`.

4.  **Usage**:
    -   Import `CustomIcon` from `components/CustomIcons`.
    -   Use it like: `<CustomIcon icon="NewIcon" className="w-6 h-6 text-orange-500" />`.

5.  **Best Practices**:
    -   **Animation**: Add subtle animations (hover, entry) to make the app feel alive.
    -   **Consistency**: Use the same stroke width and style as existing icons.
    -   **Colors**: Allow `currentColor` to control the fill/stroke via Tailwind classes.
