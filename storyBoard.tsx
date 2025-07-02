import React, { useState, useRef, useCallback } from 'react';

interface TextBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'speech' | 'thought' | 'shout';
  isSelected?: boolean;
}

interface Panel {
  id: string;
  backgroundTheme: string;
  textBubbles: TextBubble[];
  image?: string;
  imageX?: number;
  imageY?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageIsSelected?: boolean;
  order: number;
}

const BACKGROUND_THEMES = [
  { id: 'city', name: 'City', gradient: 'bg-gradient-to-b from-blue-400 to-blue-600' },
  { id: 'forest', name: 'Forest', gradient: 'bg-gradient-to-b from-green-400 to-green-700' },
  { id: 'space', name: 'Space', gradient: 'bg-gradient-to-b from-purple-900 to-black' },
  { id: 'sunset', name: 'Sunset', gradient: 'bg-gradient-to-b from-orange-400 to-pink-500' },
  { id: 'ocean', name: 'Ocean', gradient: 'bg-gradient-to-b from-cyan-400 to-blue-800' },
  { id: 'desert', name: 'Desert', gradient: 'bg-gradient-to-b from-yellow-300 to-orange-600' }
];

// Custom SVG Icons
const Icons = {
  Sun: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
    </svg>
  ),
  Plus: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  ),
  Chat: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
  ),
  Image: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  ),
  Mobile: () => (
    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"/>
    </svg>
  ),
  Lightbulb: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  )
};

const StoryboardApp: React.FC = () => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [dragOverPanel, setDragOverPanel] = useState<string | null>(null);
  const [showBubbleMenu, setShowBubbleMenu] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedBubble, setSelectedBubble] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [isResizingElement, setIsResizingElement] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createNewPanel = useCallback(() => {
    const newPanel: Panel = {
      id: `panel-${Date.now()}`,
      backgroundTheme: 'city',
      textBubbles: [],
      order: panels.length
    };
    setPanels(prev => [...prev, newPanel]);
  }, [panels.length]);

  const deletePanel = useCallback((panelId: string) => {
    setPanels(prev => {
      const filteredPanels = prev.filter(p => p.id !== panelId);
      // Reorder remaining panels
      return filteredPanels.map((panel, index) => ({
        ...panel,
        order: index
      }));
    });
    if (selectedPanel === panelId) {
      setSelectedPanel(null);
    }
  }, [selectedPanel]);

  const updatePanelTheme = useCallback((panelId: string, theme: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId ? { ...p, backgroundTheme: theme } : p
    ));
  }, []);

  const addTextBubble = useCallback((panelId: string, type: 'speech' | 'thought' | 'shout') => {
    const newBubble: TextBubble = {
      id: `bubble-${Date.now()}`,
      text: 'Type here...',
      x: Math.random() * 200 + 50,
      y: Math.random() * 150 + 50,
      width: 120,
      height: 60,
      type
    };
    setPanels(prev => prev.map(p => 
      p.id === panelId 
        ? { ...p, textBubbles: [...p.textBubbles, newBubble] }
        : p
    ));
    setShowBubbleMenu(false);
  }, []);

  const updateBubbleText = useCallback((panelId: string, bubbleId: string, text: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId 
        ? { 
            ...p, 
            textBubbles: p.textBubbles.map(b => 
              b.id === bubbleId ? { ...b, text } : b
            )
          }
        : p
    ));
  }, []);

  const deleteBubble = useCallback((panelId: string, bubbleId: string) => {
    setPanels(prev => prev.map(p => 
      p.id === panelId 
        ? { ...p, textBubbles: p.textBubbles.filter(b => b.id !== bubbleId) }
        : p
    ));
  }, []);

  const handleImageUpload = useCallback((panelId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPanels(prev => prev.map(p => 
          p.id === panelId ? { 
            ...p, 
            image: e.target?.result as string,
            imageX: 50,
            imageY: 50,
            imageWidth: 200,
            imageHeight: 150
          } : p
        ));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Touch-based drag and drop for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent, panelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setTouchCurrentY(touch.clientY);
    setDraggedPanel(panelId);
    setSelectedPanel(null);
    setShowBubbleMenu(false);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !draggedPanel) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    setTouchCurrentY(touch.clientY);
    
    // Find which panel we're hovering over
    const panelElements = document.querySelectorAll('[data-panel-id]');
    let hoveredPanelId: string | null = null;
    
    panelElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const elementId = element.getAttribute('data-panel-id');
      
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom && elementId !== draggedPanel) {
        hoveredPanelId = elementId;
      }
    });
    
    setDragOverPanel(hoveredPanelId);
  }, [isDragging, draggedPanel]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging && draggedPanel && dragOverPanel) {
      console.log('Reordering:', draggedPanel, 'to', dragOverPanel);
      
      setPanels(prev => {
        const draggedIndex = prev.findIndex(p => p.id === draggedPanel);
        const targetIndex = prev.findIndex(p => p.id === dragOverPanel);
        
        console.log('Indices:', draggedIndex, targetIndex);
        
        if (draggedIndex === -1 || targetIndex === -1) return prev;
        
        const newPanels = [...prev];
        const draggedPanelData = newPanels[draggedIndex];
        
        newPanels.splice(draggedIndex, 1);
        newPanels.splice(targetIndex, 0, draggedPanelData);
        
        return newPanels.map((panel, index) => ({
          ...panel,
          order: index
        }));
      });
    }
    
    // Reset all drag states
    setTouchStartY(null);
    setTouchCurrentY(null);
    setIsDragging(false);
    setDraggedPanel(null);
    setDragOverPanel(null);
    setDragOffset({ x: 0, y: 0 });
  }, [isDragging, draggedPanel, dragOverPanel]);

  const reorderPanels = useCallback((fromIndex: number, toIndex: number) => {
    setPanels(prev => {
      const newPanels = [...prev];
      const [movedPanel] = newPanels.splice(fromIndex, 1);
      newPanels.splice(toIndex, 0, movedPanel);
      
      return newPanels.map((panel, index) => ({
        ...panel,
        order: index
      }));
    });
  }, []);

  // Simple button-based reordering as fallback
  const movePanelUp = useCallback((panelId: string) => {
    setPanels(prev => {
      const currentIndex = prev.findIndex(p => p.id === panelId);
      if (currentIndex <= 0) return prev;
      
      const newPanels = [...prev];
      const [movedPanel] = newPanels.splice(currentIndex, 1);
      newPanels.splice(currentIndex - 1, 0, movedPanel);
      
      return newPanels.map((panel, index) => ({
        ...panel,
        order: index
      }));
    });
  }, []);

  const movePanelDown = useCallback((panelId: string) => {
    setPanels(prev => {
      const currentIndex = prev.findIndex(p => p.id === panelId);
      if (currentIndex >= prev.length - 1) return prev;
      
      const newPanels = [...prev];
      const [movedPanel] = newPanels.splice(currentIndex, 1);
      newPanels.splice(currentIndex + 1, 0, movedPanel);
      
      return newPanels.map((panel, index) => ({
        ...panel,
        order: index
      }));
    });
  }, []);

  // Element interaction handlers
  const handleElementSelect = useCallback((panelId: string, elementType: 'bubble' | 'image', elementId: string) => {
    setSelectedBubble(elementType === 'bubble' ? elementId : null);
    setSelectedImage(elementType === 'image' ? elementId : null);
    
    // Update selection state in panels
    setPanels(prev => prev.map(p => {
      if (p.id === panelId) {
        if (elementType === 'bubble') {
          return {
            ...p,
            textBubbles: p.textBubbles.map(b => ({
              ...b,
              isSelected: b.id === elementId
            }))
          };
        } else {
          return {
            ...p,
            imageIsSelected: elementId === 'image'
          };
        }
      }
      return p;
    }));
  }, []);

  const handleElementDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, panelId: string, elementType: 'bubble' | 'image', elementId: string) => {
    e.stopPropagation();
    setIsDraggingElement(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStartPos({ x: clientX, y: clientY });
    handleElementSelect(panelId, elementType, elementId);
  }, [handleElementSelect]);

  const handleElementDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingElement || (!selectedBubble && !selectedImage)) return;
    
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartPos.x;
    const deltaY = clientY - dragStartPos.y;
    
    setPanels(prev => prev.map(p => {
      if (selectedBubble) {
        return {
          ...p,
          textBubbles: p.textBubbles.map(b => 
            b.id === selectedBubble 
              ? { ...b, x: Math.max(0, b.x + deltaX), y: Math.max(0, b.y + deltaY) }
              : b
          )
        };
      } else if (selectedImage && p.imageIsSelected) {
        return {
          ...p,
          imageX: Math.max(0, (p.imageX || 50) + deltaX),
          imageY: Math.max(0, (p.imageY || 50) + deltaY)
        };
      }
      return p;
    }));
    
    setDragStartPos({ x: clientX, y: clientY });
  }, [isDraggingElement, selectedBubble, selectedImage, dragStartPos]);

  const handleElementDragEnd = useCallback(() => {
    setIsDraggingElement(false);
    setIsResizingElement(false);
  }, []);

  const handleElementResize = useCallback((panelId: string, elementType: 'bubble' | 'image', elementId: string, newWidth: number, newHeight: number) => {
    setPanels(prev => prev.map(p => {
      if (p.id === panelId) {
        if (elementType === 'bubble') {
          return {
            ...p,
            textBubbles: p.textBubbles.map(b => 
              b.id === elementId 
                ? { ...b, width: Math.max(60, newWidth), height: Math.max(30, newHeight) }
                : b
            )
          };
        } else {
          return {
            ...p,
            imageWidth: Math.max(50, newWidth),
            imageHeight: Math.max(50, newHeight)
          };
        }
      }
      return p;
    }));
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent, panelId: string, elementType: 'bubble' | 'image', elementId: string) => {
    e.stopPropagation();
    setIsResizingElement(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStartPos({ x: clientX, y: clientY });
  }, []);

  const handleResizeMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isResizingElement || (!selectedBubble && !selectedImage)) return;
    
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - dragStartPos.x;
    const deltaY = clientY - dragStartPos.y;
    
    setPanels(prev => prev.map(p => {
      if (selectedBubble) {
        const bubble = p.textBubbles.find(b => b.id === selectedBubble);
        if (bubble) {
          const newWidth = Math.max(60, bubble.width + deltaX);
          const newHeight = Math.max(30, bubble.height + deltaY);
          return {
            ...p,
            textBubbles: p.textBubbles.map(b => 
              b.id === selectedBubble 
                ? { ...b, width: newWidth, height: newHeight }
                : b
            )
          };
        }
      } else if (selectedImage && p.imageIsSelected) {
        const newWidth = Math.max(50, (p.imageWidth || 200) + deltaX);
        const newHeight = Math.max(50, (p.imageHeight || 150) + deltaY);
        return {
          ...p,
          imageWidth: newWidth,
          imageHeight: newHeight
        };
      }
      return p;
    }));
    
    setDragStartPos({ x: clientX, y: clientY });
  }, [isResizingElement, selectedBubble, selectedImage, dragStartPos]);

  const getBubbleStyle = (type: string) => {
    switch (type) {
      case 'thought':
        return 'bg-white border-2 border-gray-300 rounded-full';
      case 'shout':
        return 'bg-yellow-200 border-2 border-yellow-400 transform rotate-1';
      default:
        return 'bg-white border-2 border-gray-300 rounded-lg';
    }
  };

  const sortedPanels = [...panels].sort((a, b) => a.order - b.order);

  if (isPreviewMode) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsPreviewMode(false)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Icons.ArrowLeft />
              <span>Edit Mode</span>
            </button>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Storyboard Preview
            </h1>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4 space-y-4">
          {sortedPanels.map((panel) => {
            const theme = BACKGROUND_THEMES.find(t => t.id === panel.backgroundTheme);
            return (
              <div key={panel.id} className="relative">
                <div className={`relative w-full h-80 ${theme?.gradient} rounded-xl shadow-lg overflow-hidden`}>
                  {panel.image && (
                    <img
                      src={panel.image}
                      alt="Panel content"
                      className="absolute rounded"
                      style={{
                        left: `${panel.imageX || 50}px`,
                        top: `${panel.imageY || 50}px`,
                        width: `${panel.imageWidth || 200}px`,
                        height: `${panel.imageHeight || 150}px`,
                        objectFit: 'contain'
                      }}
                    />
                  )}
                  {panel.textBubbles.map((bubble) => (
                    <div
                      key={bubble.id}
                      className={`absolute ${getBubbleStyle(bubble.type)} p-2 text-xs shadow-md`}
                      style={{
                        left: `${bubble.x}px`,
                        top: `${bubble.y}px`,
                        width: `${bubble.width}px`,
                        height: `${bubble.height}px`,
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {bubble.text}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-50 shadow-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between p-4">
          <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
            StoryBoard
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPreviewMode(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all transform hover:scale-105 shadow-md"
            >
              <Icons.Eye />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-all transform hover:scale-105 ${
                isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'
              }`}
            >
              {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Add Panel Button */}
        <button
          onClick={createNewPanel}
          className="w-full mb-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg font-semibold text-lg flex items-center justify-center space-x-2"
        >
          <Icons.Plus />
          <span>Create New Panel</span>
        </button>

        {/* Drag Instructions */}
        {panels.length > 1 && !draggedPanel && (
          <div className={`mb-4 p-3 rounded-lg text-center text-sm flex items-center justify-center space-x-2 ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-blue-700'
          }`}>
            <Icons.Lightbulb />
            <span>Touch and hold the grip handle to drag panels</span>
          </div>
        )}

        {/* Drag Status */}
        {isDragging && draggedPanel && (
          <div className={`mb-4 p-3 rounded-lg text-center text-sm flex items-center justify-center space-x-2 ${
            isDarkMode ? 'bg-green-800 text-green-300' : 'bg-green-50 text-green-700'
          }`}>
            <span>🔄 Dragging panel {panels.find(p => p.id === draggedPanel)?.order + 1}</span>
          </div>
        )}

        {/* Panels */}
        <div 
          className="space-y-6" 
          onTouchMove={handleTouchMove} 
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {sortedPanels.map((panel) => {
            const theme = BACKGROUND_THEMES.find(t => t.id === panel.backgroundTheme);
            const isSelected = selectedPanel === panel.id;
            const isPanelDragging = draggedPanel === panel.id;
            const isDragOver = dragOverPanel === panel.id;
            
            return (
              <div
                key={panel.id}
                data-panel-id={panel.id}
                className={`relative transition-all duration-300 ${
                  isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''
                } ${
                  isDragOver ? 'ring-4 ring-green-400 ring-opacity-70 transform scale-105' : ''
                } ${
                  isPanelDragging ? 'opacity-60 transform rotate-2 scale-95 z-50' : ''
                } ${
                  isDragging ? 'pointer-events-none' : ''
                }`}
                style={{
                  transform: isPanelDragging && touchCurrentY && touchStartY 
                    ? `translateY(${touchCurrentY - touchStartY}px) rotate(2deg) scale(0.95)` 
                    : undefined
                }}
              >
                {/* Mobile Touch Drag Handle */}
                <div 
                  className={`absolute -left-4 top-1/2 transform -translate-y-1/2 z-20 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  } ${isPanelDragging ? 'text-blue-500' : ''}`}
                  onTouchStart={(e) => {
                    console.log('Touch start on panel:', panel.id);
                    handleTouchStart(e, panel.id);
                  }}
                  style={{ touchAction: 'none' }}
                >
                  <div className={`flex flex-col space-y-0.5 p-2 rounded-lg transition-all ${
                    isPanelDragging ? 'bg-blue-100 shadow-lg' : 'bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
                  } cursor-grab active:cursor-grabbing touch-manipulation border border-gray-300`}>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                </div>

                <div
                  className={`relative w-full h-80 ${theme?.gradient} rounded-xl shadow-lg overflow-hidden cursor-pointer transition-transform ${
                    !isPanelDragging ? 'hover:scale-105' : ''
                  }`}
                  onClick={() => !isPanelDragging && !isDragging && setSelectedPanel(isSelected ? null : panel.id)}
                  onMouseMove={(e) => {
                    if (isDraggingElement && !isResizingElement) {
                      handleElementDragMove(e);
                    } else if (isResizingElement && !isDraggingElement) {
                      handleResizeMove(e);
                    }
                  }}
                  onTouchMove={(e) => {
                    if (isDraggingElement && !isResizingElement) {
                      handleElementDragMove(e);
                    } else if (isResizingElement && !isDraggingElement) {
                      handleResizeMove(e);
                    }
                  }}
                  onMouseUp={() => {
                    if (isDraggingElement) setIsDraggingElement(false);
                    if (isResizingElement) setIsResizingElement(false);
                  }}
                  onTouchEnd={() => {
                    if (isDraggingElement) setIsDraggingElement(false);
                    if (isResizingElement) setIsResizingElement(false);
                  }}
                  style={{ touchAction: 'none' }}
                >
                  {/* Interactive Image */}
                  {panel.image && (
                    <div
                      className={`absolute cursor-move ${panel.imageIsSelected ? 'ring-2 ring-blue-400 ring-opacity-70' : ''}`}
                      style={{
                        left: `${panel.imageX || 50}px`,
                        top: `${panel.imageY || 50}px`,
                        width: `${panel.imageWidth || 200}px`,
                        height: `${panel.imageHeight || 150}px`,
                        minWidth: '50px',
                        minHeight: '50px',
                        maxWidth: 'none',
                        maxHeight: 'none',
                        boxSizing: 'border-box',
                        background: 'none',
                        zIndex: 10,
                        touchAction: 'none'
                      }}
                      onMouseDown={(e) => handleElementDragStart(e, panel.id, 'image', 'image')}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleElementDragStart(e, panel.id, 'image', 'image');
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleElementSelect(panel.id, 'image', 'image');
                      }}
                    >
                      <img
                        src={panel.image}
                        alt="Panel content"
                        className="rounded"
                        style={{width: `${panel.imageWidth || 200}px`, height: `${panel.imageHeight || 150}px`, objectFit: 'contain', display: 'block', maxWidth: 'none', maxHeight: 'none'}}
                      />
                      
                      {/* Image Resize Handle */}
                      {panel.imageIsSelected && (
                        <div 
                          className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full cursor-se-resize flex items-center justify-center"
                          onMouseDown={(e) => handleResizeStart(e, panel.id, 'image', 'image')}
                          onTouchStart={(e) => handleResizeStart(e, panel.id, 'image', 'image')}
                        >
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      )}
                      
                      {/* Image Delete Button */}
                      {panel.imageIsSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPanels(prev => prev.map(p => 
                              p.id === panel.id ? { ...p, image: undefined, imageIsSelected: false } : p
                            ));
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                        >
                          <Icons.X />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Interactive Text Bubbles */}
                  {panel.textBubbles.map((bubble) => (
                    <div 
                      key={bubble.id} 
                      className={`absolute cursor-move ${bubble.isSelected ? 'ring-2 ring-blue-400 ring-opacity-70' : ''}`}
                      style={{
                        left: `${bubble.x}px`,
                        top: `${bubble.y}px`,
                        width: `${bubble.width}px`,
                        height: `${bubble.height}px`,
                        minWidth: '60px',
                        minHeight: '30px',
                        maxWidth: 'none',
                        maxHeight: 'none',
                        boxSizing: 'border-box',
                        background: 'none',
                        zIndex: 10,
                        touchAction: 'none'
                      }}
                      onMouseDown={(e) => handleElementDragStart(e, panel.id, 'bubble', bubble.id)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleElementDragStart(e, panel.id, 'bubble', bubble.id);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleElementSelect(panel.id, 'bubble', bubble.id);
                      }}
                    >
                                              <div className={`${getBubbleStyle(bubble.type)} p-2 text-xs shadow-md`} style={{width: `${bubble.width}px`, height: `${bubble.height}px`, overflow: 'hidden', wordBreak: 'break-word', display: 'block', boxSizing: 'border-box', maxWidth: 'none', maxHeight: 'none'}}>
                          <textarea
                            value={bubble.text}
                            onChange={(e) => updateBubbleText(panel.id, bubble.id, e.target.value)}
                            className="bg-transparent border-none outline-none text-xs text-left break-words overflow-hidden resize-none"
                            onClick={(e) => e.stopPropagation()}
                            style={{width: `${bubble.width - 16}px`, height: `${bubble.height - 16}px`, resize: 'none', maxWidth: 'none', maxHeight: 'none'}}
                          />
                        </div>
                      
                      {/* Bubble Resize Handle */}
                      {bubble.isSelected && (
                        <div 
                          className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize flex items-center justify-center"
                          onMouseDown={(e) => handleResizeStart(e, panel.id, 'bubble', bubble.id)}
                          onTouchStart={(e) => handleResizeStart(e, panel.id, 'bubble', bubble.id)}
                        >
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                      
                      {/* Bubble Delete Button */}
                      {bubble.isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBubble(panel.id, bubble.id);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
                        >
                          <Icons.X />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Panel Number */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm font-semibold">
                    {panel.order + 1}
                  </div>

                  {/* Move Up Button */}
                  {panel.order > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePanelUp(panel.id);
                      }}
                      className="absolute top-2 right-16 w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-bold flex items-center justify-center"
                    >
                      ↑
                    </button>
                  )}

                  {/* Move Down Button */}
                  {panel.order < panels.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePanelDown(panel.id);
                      }}
                      className="absolute top-2 right-8 w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-bold flex items-center justify-center"
                    >
                      ↓
                    </button>
                  )}

                  {/* Delete Panel Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePanel(panel.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-bold flex items-center justify-center"
                  >
                    <Icons.X />
                  </button>

                  {/* Drop Zone Indicator */}
                  {isDragOver && (
                    <div className="absolute inset-0 bg-green-400 bg-opacity-20 border-4 border-green-400 border-dashed rounded-xl flex items-center justify-center">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
                        Drop Here
                      </div>
                    </div>
                  )}
                </div>

                {/* Panel Controls */}
                {isSelected && !isPanelDragging && !isDragging && (
                  <div className={`mt-4 p-4 rounded-lg shadow-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    {/* Background Themes */}
                    <div className="mb-4">
                      <h3 className={`text-sm font-semibold mb-2 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Background Theme
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {BACKGROUND_THEMES.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => updatePanelTheme(panel.id, theme.id)}
                            className={`h-12 ${theme.gradient} rounded-lg border-2 transition-all ${
                              panel.backgroundTheme === theme.id
                                ? 'border-blue-400 ring-2 ring-blue-200'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowBubbleMenu(!showBubbleMenu)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <Icons.Chat />
                        <span>Add Bubble</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg hover:from-indigo-600 hover:to-blue-600 transition-all text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <Icons.Image />
                        <span>Add Image</span>
                      </button>
                    </div>

                    {/* Bubble Type Menu */}
                    {showBubbleMenu && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => addTextBubble(panel.id, 'speech')}
                          className="py-2 px-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                        >
                          Speech
                        </button>
                        <button
                          onClick={() => addTextBubble(panel.id, 'thought')}
                          className="py-2 px-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                        >
                          Thought
                        </button>
                        <button
                          onClick={() => addTextBubble(panel.id, 'shout')}
                          className="py-2 px-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm"
                        >
                          Shout
                        </button>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(panel.id, e)}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {panels.length === 0 && (
          <div className={`text-center py-12 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="mb-4 flex justify-center">
              <Icons.Mobile />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create Your First Panel</h2>
            <p>Tap the button above to start your storyboard!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryboardApp; 
