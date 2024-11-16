export function isFrameHeading(element: HTMLElement | null): boolean {
    if (!element) return false
    return (
      element.classList.contains('tl-frame-heading') ||
      element.classList.contains('tl-frame-heading-text') ||
      element.classList.contains('tl-frame-heading-input')
    )
  }
  
  export function getFrameFromElement(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null
    return element.closest('.tl-frame')
  }
  
  export function isEditingFrameHeading(element: HTMLElement | null): boolean {
    if (!element) return false
    return element.classList.contains('tl-frame-heading-input')
  }