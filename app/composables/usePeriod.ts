export function usePeriod() {
  const period = useState<number>('period', () => 30)
  const refreshKey = useState<number>('refreshKey', () => 0)
  return { period, refreshKey }
}
