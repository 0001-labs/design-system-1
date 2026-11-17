import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  type ChangeEvent,
  type InputEvent as ReactInputEvent,
  type InputHTMLAttributes,
  type Ref,
} from "react";
import type { Input as InputElement } from "../2-core/ds-input";
export type { InputElement };
export type InputProps = Omit<
  InputHTMLAttributes<InputElement>,
  "value" | "defaultValue" | "type" | "size"
> & {
  value?: string | number;
  defaultValue?: string | number;
  type?: InputElement["type"];
  variant?: InputElement["variant"];
  revealable?: boolean;
  quietFocus?: boolean;
  label?: string;
  labelText?: string;
  placeholderKey?: string;
  error?: string;
  errorText?: string;
  suggestions?: InputElement["suggestions"];
  multiline?: boolean;
  rows?: number;
  wrap?: "soft" | "hard" | "off";
  autoGrow?: boolean;
  maxRows?: number;
};
const useCommitEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
function reactEvent(event: Event, field: InputElement) {
  return new Proxy(event, {
    get(native, key) {
      if (key === "target" || key === "currentTarget") return field;
      if (key === "nativeEvent") return native;
      if (key === "persist") return () => {};
      if (key === "isDefaultPrevented") return () => native.defaultPrevented;
      if (key === "isPropagationStopped") return () => native.cancelBubble;
      const value = Reflect.get(native, key, native);
      return typeof value === "function" ? value.bind(native) : value;
    },
  });
}
function setRef(ref: Ref<InputElement> | undefined, field: InputElement | null) {
  if (typeof ref === "function") return ref(field);
  if (ref) ref.current = field;
}

export const Input = forwardRef<InputElement, InputProps>(function Field(
    {
      value,
      defaultValue,
      onChange,
      onInput,
      autoFocus,
      autoComplete,
      inputMode,
      readOnly,
      minLength,
      maxLength,
      min,
      max,
      step,
      spellCheck,
      form,
      type = "text",
      variant = "field",
      quietFocus,
      multiline,
      autoGrow,
      maxRows,
      labelText,
      placeholderKey,
      errorText,
      ...props
    },
    forwardedRef,
  ) {
    const field = useRef<InputElement | null>(null);
    const initial = useRef(String(defaultValue ?? ""));
    const [, refresh] = useReducer((version: number) => version + 1, 0);
    const controlled = value !== undefined;
    const ref = useCallback(
      (element: InputElement | null) => {
        field.current = element;
        return setRef(forwardedRef, element);
      },
      [forwardedRef],
    );
    useCommitEffect(() => {
      if (controlled && field.current) field.current.value = String(value);
      if (form !== undefined) field.current?.setAttribute("form", form);
      else field.current?.removeAttribute("form");
    });
    useEffect(() => {
      const element = field.current;
      if (!element || !controlled) return;
      const reset = () => refresh();
      element.addEventListener("input-reset", reset);
      return () => element.removeEventListener("input-reset", reset);
    }, [controlled]);
    const attributes: Record<string, unknown> = { ...props };
    const listeners: Array<{ name: string; capture: boolean; callback: EventListener }> = [];
    for (const key of Object.keys(attributes)) {
      if (key.startsWith("aria-") && typeof attributes[key] === "boolean")
        attributes[key] = String(attributes[key]);
      if (/^on[A-Z]/.test(key) && typeof attributes[key] === "function") {
        const callback = attributes[key] as (event: Event) => void;
        const capture = key.endsWith("Capture");
        const name = key.slice(2, capture ? -7 : undefined);
        const native =
          (
            { Focus: "focusin", Blur: "focusout", DoubleClick: "dblclick" } as Record<
              string,
              string
            >
          )[name] ?? name.toLowerCase();
        listeners.push({
          name: native,
          capture,
          callback: (event: Event) => {
            if (field.current) callback(reactEvent(event, field.current));
          },
        });
        delete attributes[key];
      }
    }
    listeners.push({
      name: "input",
      capture: false,
      callback: (native: Event) => {
        if (!field.current) return;
        const event = reactEvent(native, field.current);
        onInput?.(event as unknown as ReactInputEvent<InputElement>);
        onChange?.(event as unknown as ChangeEvent<InputElement>);
        if (controlled) refresh();
      },
    });
    useCommitEffect(() => {
      const element = field.current;
      if (!element) return;
      for (const { name, callback, capture } of listeners)
        element.addEventListener(name, callback, capture);
      return () => {
        for (const { name, callback, capture } of listeners)
          element.removeEventListener(name, callback, capture);
      };
    });
    return createElement("ds-input", {
      ...attributes,
      ref,
      type,
      variant,
      value: controlled ? String(value) : initial.current,
      autofocus: autoFocus,
      autocomplete: autoComplete,
      inputmode: inputMode,
      readonly: readOnly,
      minlength: minLength,
      maxlength: maxLength,
      min: min == null ? undefined : String(min),
      max: max == null ? undefined : String(max),
      step: step == null ? undefined : String(step),
      spellcheck: spellCheck === undefined ? undefined : String(spellCheck),
      "quiet-focus": quietFocus,
      "label-text": labelText,
      "placeholder-key": placeholderKey,
      "error-text": errorText,
      multiline: multiline || undefined,
      "auto-grow": autoGrow,
      "max-rows": maxRows,
    });
});
