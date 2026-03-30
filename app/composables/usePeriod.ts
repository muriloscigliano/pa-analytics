export function usePeriod() {
  const period = useState<number>('period', () => 7)
  const refreshKey = useState<number>('refreshKey', () => 0)
  return { period, refreshKey }
}
