import { Children, cloneElement, isValidElement, useId } from 'react'

// Label + control + error/hint. The error sits outside the <label> and is linked with
// aria-describedby, so screen readers (and getByLabelText) see a clean label.
export default function Field({ label, error, hint, children, htmlFor }) {
  const autoId = useId()
  const child = Children.only(children)
  const id = htmlFor || child.props?.id || autoId
  const messageId = `${id}-message`
  const message = error || hint

  const control = isValidElement(child)
    ? cloneElement(child, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': message ? messageId : undefined,
      })
    : child

  return (
    <div className="block">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      {control}
      {error ? (
        <span id={messageId} className="mt-1 block text-xs text-crimson">
          {error}
        </span>
      ) : hint ? (
        <span id={messageId} className="mt-1 block text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </div>
  )
}
