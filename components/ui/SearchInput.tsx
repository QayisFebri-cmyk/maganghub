import ui from '@/styles/ui.module.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
}: SearchInputProps) {
  return (
    <div className={ui.search}>
      <span className={ui.searchIcon} aria-hidden="true">
        🔍
      </span>
      <input
        type="search"
        className={ui.searchInput}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  )
}
