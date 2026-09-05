interface LegendItemProps {
  label: string
  color: string
  active?: boolean
  onToggle: (value: boolean) => void
}

export function LegendItem(props: LegendItemProps) {
  return (
    <div
      class={[
        'flex cursor-pointer items-center gap-1.4 whitespace-nowrap',
        { 'opacity-30': !props.active },
      ]}
      onClick={() => props.onToggle(!props.active)}
    >
      <span
        class="h-2.5 w-2.5 border-2 border-white rounded-full shadow-[0_0_0_2px_#11182714] dark:shadow-[0_0_0_2px_#ffffff30]"
        style={{ background: props.color }}
        aria-hidden="true"
      />
      <span>{props.label}</span>
    </div>
  )
}
