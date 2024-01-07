import { default as dayjs } from 'dayjs';

export function generateTableHours(startHourAndMinutes: string, endHourAndMinutes: string, interval: number) {
    if(RegExp(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).test(startHourAndMinutes) === false || RegExp(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).test(endHourAndMinutes) === false) {
        throw new Error('Invalid time format')
    }
    
    const hours = []
    const start = dayjs().hour(+startHourAndMinutes.split(':')[0]).minute(+startHourAndMinutes.split(':')[1])
    const end = dayjs().hour(+endHourAndMinutes.split(':')[0]).minute(+endHourAndMinutes.split(':')[1])
    const diff = end.diff(start, 'minute')
    const numberOfIntervals = diff / interval
    for (let i = 0; i < numberOfIntervals; i++) {
        const current = start.add(interval * i, 'minute')
        const next = start.add(interval * (i + 1), 'minute')
        hours.push({id: i, start: current.format('HH:mm'), end: next.format('HH:mm')})
    }

    return hours
}