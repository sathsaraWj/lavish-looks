import { useEffect, useRef } from 'react'

/**
 * Moves keyboard/screen-reader focus to the page heading whenever a multi-step
 * page changes stage (form -> verify -> payment -> summary). Attach the returned
 * ref to the stage's <h1 tabIndex={-1}>. Does nothing on the first render.
 */
export function useStageFocus(stage: string) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previousStage = useRef(stage)

  useEffect(() => {
    if (previousStage.current === stage) return
    previousStage.current = stage
    headingRef.current?.focus()
  }, [stage])

  return headingRef
}
