import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Keyboard, Globe, Delete } from 'lucide-react';

interface TamilKeyboardProps {
  onTextChange: (text: string) => void;
  currentText: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function TamilKeyboard({ onTextChange, currentText, isVisible, onToggle }: TamilKeyboardProps) {
  const [isEnglish, setIsEnglish] = useState(false);

  // Tamil keyboard layout - simplified phonetic mapping
  const tamilKeys = [
    ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ'],
    ['க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம'],
    ['ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன', 'ஸ', 'ஹ'],
    ['ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ', 'ி', 'ீ', 'ு', 'ூ']
  ];

  // Common Tamil words/phrases for quick access
  const quickTamilPhrases = [
    'வணக்கம்', 'நன்றி', 'சரி', 'இல்லை', 'எப்படி', 'எங்கே', 
    'யார்', 'என்ன', 'எப்போது', 'எதற்காக', 'அன்னா', 'அக்கா',
    'அம்மா', 'அப்பா', 'நண்பன்', 'area', 'செய்யலாம்', 'பார்க்கலாம்'
  ];

  const englishKeys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const handleKeyPress = (key: string) => {
    onTextChange(currentText + key);
  };

  const handleBackspace = () => {
    onTextChange(currentText.slice(0, -1));
  };

  const handleSpace = () => {
    onTextChange(currentText + ' ');
  };

  const handlePhraseSelect = (phrase: string) => {
    const newText = currentText ? currentText + ' ' + phrase : phrase;
    onTextChange(newText);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-20 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg"
      >
        <Keyboard className="w-4 h-4 mr-1" />
        தமிழ்
      </Button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <Card className="rounded-none border-0 shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-orange-600" />
            <Badge className={`${isEnglish ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
              {isEnglish ? 'English' : 'தமிழ்'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsEnglish(!isEnglish)}
              variant="outline"
              size="sm"
              className="px-2 py-1 h-auto"
            >
              <Globe className="w-3 h-3 mr-1" />
              {isEnglish ? 'தமிழ்' : 'Eng'}
            </Button>
            <Button
              onClick={onToggle}
              variant="outline"
              size="sm"
              className="px-2 py-1 h-auto"
            >
              ×
            </Button>
          </div>
        </div>

        {/* Quick phrases for Tamil */}
        {!isEnglish && (
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Quick phrases • வேகமான வார்த்தைகள்:</p>
            <div className="flex flex-wrap gap-1">
              {quickTamilPhrases.slice(0, 8).map((phrase) => (
                <Button
                  key={phrase}
                  onClick={() => handlePhraseSelect(phrase)}
                  variant="outline"
                  size="sm"
                  className="text-xs px-2 py-1 h-auto border-orange-200 hover:bg-orange-50"
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard */}
        <div className="p-3">
          <div className="space-y-2">
            {(isEnglish ? englishKeys : tamilKeys).map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1">
                {row.map((key) => (
                  <Button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    variant="outline"
                    className="min-w-[32px] h-10 p-0 text-base border-gray-200 hover:bg-orange-50 hover:border-orange-300"
                  >
                    {key}
                  </Button>
                ))}
              </div>
            ))}
            
            {/* Bottom row with space and backspace */}
            <div className="flex justify-center gap-2 mt-3">
              <Button
                onClick={handleBackspace}
                variant="outline"
                className="px-4 h-10 border-gray-200 hover:bg-red-50"
              >
                <Delete className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSpace}
                variant="outline"
                className="flex-1 h-10 border-gray-200 hover:bg-gray-50"
              >
                Space
              </Button>
              <Button
                onClick={() => handleKeyPress('.')}
                variant="outline"
                className="px-4 h-10 border-gray-200 hover:bg-gray-50"
              >
                .
              </Button>
            </div>
          </div>
        </div>

        {/* Input preview */}
        <div className="px-3 pb-3">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Preview:</p>
            <p className="text-base min-h-[24px]">
              {currentText || (
                <span className="text-gray-400 italic">
                  {isEnglish ? 'Start typing...' : 'டைப் பண்ண ஆரம்பிங்க...'}
                </span>
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}