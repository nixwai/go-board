/** GoHistoryButton 组件的输入属性。 */
export interface GoHistoryButtonProps {
  /** 是否禁用历史记录切换。 */
  disabled?: boolean
  /** 有符号整数步数；正数前进，负数后退，0 清空历史，非整数禁用。 */
  step?: number
}
