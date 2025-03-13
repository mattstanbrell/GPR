import Image from "next/image"

interface ToggleProps {
    sidebarToggle: () => void
    source?: string
    alt?: string
    className?: string
}

const Toggle = ({sidebarToggle, source, alt, className} : ToggleProps) => {
  return (
    <Image 
        src={source || "/more-options.svg"}
        alt={alt || "More Options"}
        width={30} 
        height={30}
        className={className}
        onClick={sidebarToggle}
    />
  )
}

export default Toggle