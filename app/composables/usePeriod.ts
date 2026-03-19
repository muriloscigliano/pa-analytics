export function usePeriod() {
  const period = useState<number>('period', () => 30)
  return period
}
