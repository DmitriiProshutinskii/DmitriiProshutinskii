import { Toaster as Sonner, type ToasterProps } from "sonner"

import { useIsDark } from "@/hooks/use-theme"

const Toaster = ({ ...props }: ToasterProps) => {
  const dark = useIsDark()

  return (
    <Sonner
      theme={dark ? "dark" : "light"}
      className="toaster group"
      position="bottom-center"
      style={
        {
          "--normal-bg": "var(--primary)",
          "--normal-text": "var(--primary-foreground)",
          "--normal-border": "var(--primary)",
          "--border-radius": "999px",
        } as React.CSSProperties
      }
      toastOptions={{ classNames: { toast: "!w-auto !mx-auto !justify-center !font-bold !py-3 !px-5" } }}
      {...props}
    />
  )
}

export { Toaster }
