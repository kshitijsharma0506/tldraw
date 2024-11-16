import { useState, useCallback, useRef } from 'react'

export interface UseFrameHeadingProps {
  initialHeading?: string
  onChange?: (heading: string) => void
  onEditingChange?: (isEditing: boolean) => void
}

export function useFrameHeading({
  initialHeading = '',
  onChange,
  onEditingChange
}: UseFrameHeadingProps = {}) {
  const [heading, setHeading] = useState(initialHeading)
  const [isEditing, setIsEditing] = useState(false)
  const previousHeading = useRef(initialHeading)

  const handleHeadingChange = useCallback((value: string) => {
    setHeading(value)
    onChange?.(value)
  }, [onChange])

  const startEditing = useCallback(() => {
    previousHeading.current = heading
    setIsEditing(true)
    onEditingChange?.(true)
  }, [heading, onEditingChange])

  const stopEditing = useCallback((shouldRevert = false) => {
    if (shouldRevert) {
      setHeading(previousHeading.current)
      onChange?.(previousHeading.current)
    }
    setIsEditing(false)
    onEditingChange?.(false)
  }, [onChange, onEditingChange])

  return {
    heading,
    isEditing,
    handleHeadingChange,
    startEditing,
    stopEditing
  }
}