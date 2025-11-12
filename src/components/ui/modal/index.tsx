import { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean; // New prop to control close button visibility
  isFullscreen?: boolean; // Default to false for backwards compatibility
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full max-w-md mx-4 rounded-3xl bg-white p-6 dark:bg-gray-900";

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-50">
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-black/10 backdrop-blur-[5px]"
          onClick={onClose}
        ></div>
      )}
      <div
        ref={modalRef}
        className={`${contentClasses} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>{children}</div>
      </div>
    </div>
  );
};
