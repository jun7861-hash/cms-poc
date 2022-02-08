import React from 'react'
import DatePicker from 'react-datepicker'
const dateTimePicker = ({
  date,
  setDate,
  timeLabel,
  timeFormat,
  className,
}) => {
  return (
    <form autoComplete="off">
      <DatePicker
        selected={date}
        onChange={(date, event) => {
          setDate(date)
          event?.stopPropagation()
        }}
        timeInputLabel={timeLabel}
        dateFormat={timeFormat}
        showTimeInput
        popperPlacement="top-end"
        minDate={new Date()}
        className={className || ""}
        name="publish_date"
        autoComplete="off"
        // minTime={new Date().getTime}
      />
    </form>
  )
}

export default dateTimePicker
