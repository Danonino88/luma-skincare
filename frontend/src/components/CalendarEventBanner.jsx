import { useEffect, useMemo } from 'react'
import { calendarEvents } from '../data/siteData'

function normalizeDate(value, endOfDay = false) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0)
}

function getActiveEvent(today = new Date()) {
  return calendarEvents.find((event) => {
    const start = normalizeDate(event.start)
    const end = normalizeDate(event.end, true)
    return today >= start && today <= end
  }) || null
}

function CalendarEventBanner({ navigateTo }) {
  const activeEvent = useMemo(() => getActiveEvent(), [])

  useEffect(() => {
    document.documentElement.dataset.calendarTheme = activeEvent?.theme || 'default'
    return () => {
      document.documentElement.dataset.calendarTheme = 'default'
    }
  }, [activeEvent])

  if (!activeEvent) return null

  const handleClick = () => {
    navigateTo(activeEvent.action.page, activeEvent.action.section)
  }

  return (
    <section className={`calendar-event-banner ${activeEvent.theme}`} aria-label="Evento calendarizado activo">
      <div>
        <span>{activeEvent.eyebrow}</span>
        <strong>{activeEvent.title}</strong>
        <p>{activeEvent.description}</p>
      </div>
      <button type="button" onClick={handleClick}>{activeEvent.cta}</button>
    </section>
  )
}

export default CalendarEventBanner
