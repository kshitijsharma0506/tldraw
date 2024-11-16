import { useCallback, useState, useRef, useEffect } from 'react'
import { Vec2d } from '@tldraw/primitives'

interface FrameProps {
  id: string
  heading: string
  onHeadingChange: (value: string) => void
  onEditingChange?: (isEditing: boolean) => void
}

export function Frame({ 
  id, 
  heading, 
  onHeadingChange,
  onEditingChange 
}: FrameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousHeading = useRef(heading)
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select()
    }
    onEditingChange?.(isEditing)
  }, [isEditing, onEditingChange])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsEditing(true)
  }, [])

  const handleBlur = useCallback(() => {
    // Only update if content changed
    if (previousHeading.current !== heading) {
      previousHeading.current = heading
    }
    setIsEditing(false)
  }, [heading])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter': {
        e.preventDefault()
        e.stopPropagation()
        inputRef.current?.blur()
        break
      }
      case 'Escape': {
        e.preventDefault()
        e.stopPropagation()
        // Restore previous value on escape
        onHeadingChange(previousHeading.current)
        setIsEditing(false)
        break
      }
      default: {
        e.stopPropagation()
      }
    }
  }, [onHeadingChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onHeadingChange(e.target.value)
  }, [onHeadingChange])

  return (
    <div 
      className="tl-frame" 
      data-id={id}
      data-testid="frame"
    >
      <div 
        className="tl-frame-heading"
        onDoubleClick={handleDoubleClick}
        style={{ 
          pointerEvents: 'all',
          userSelect: 'none',
          cursor: 'default'
        }}
        data-testid="frame-heading"
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={heading}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="tl-frame-heading-input"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              font: 'inherit',
              cursor: 'text',
              userSelect: 'text'
            }}
            data-testid="frame-heading-input"
          />
        ) : (
          <span 
            className="tl-frame-heading-text"
            data-testid="frame-heading-text"
          >
            {heading || 'Frame'}
          </span>
        )}
      </div>
    </div>
  )
}