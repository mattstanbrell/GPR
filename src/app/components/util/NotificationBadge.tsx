interface NotificationBadgeProps {
    count: number
    className?: string
}

const NotificationBadge = ({count, className}: NotificationBadgeProps) => {
  return (
    <div className={"bg-(--color-button-primary) text-white rounded-[50%] w-6 h-6 flex items-center justify-center " + className}>
      {(count > 9) ? '9+' : count.toString()}
    </div>
  )
}

export default NotificationBadge