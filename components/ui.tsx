'use client'
import { C, ini } from '@/lib/constants'
import { CSSProperties, ReactNode } from 'react'

export function pill(label: string, c: string, bg: string) {
  return (
    <span style={{fontSize:11,fontWeight:600,color:c,background:bg,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap"}}>
      {label}
    </span>
  )
}

export function Av({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:C.blue100,color:C.blue700,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:700,flexShrink:0}}>
      {ini(name)}
    </div>
  )
}

export function Card({ title, action, onAction, children, noPad, mb, style }: {
  title?: string; action?: string; onAction?: () => void
  children: ReactNode; noPad?: boolean; mb?: number; style?: CSSProperties
}) {
  return (
    <div style={{background:C.white,border:`1px solid ${C.gray200}`,borderRadius:12,overflow:"hidden",marginBottom:mb??16,...(style??{})}}>
      {title && (
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.gray100}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontSize:14,fontWeight:700,color:C.gray900}}>{title}</span>
          {action && <button onClick={onAction} style={{fontSize:12,color:C.blue700,fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>{action}</button>}
        </div>
      )}
      <div style={noPad ? {} : {padding:"16px 20px"}}>{children}</div>
    </div>
  )
}

export function Btn({ children, v = "primary", sm, onClick, full, disabled }: {
  children: ReactNode; v?: "primary"|"outline"|"ghost"|"danger"|"success"
  sm?: boolean; onClick?: () => void; full?: boolean; disabled?: boolean
}) {
  const base: CSSProperties = {padding:sm?"6px 12px":"9px 18px",fontSize:sm?11:13,fontWeight:600,borderRadius:8,cursor:disabled?"not-allowed":"pointer",border:"none",opacity:disabled?0.5:1,width:full?"100%":undefined,textAlign:"center"}
  const vs = {
    primary: {background:C.blue700,color:C.white},
    outline: {background:"transparent",color:C.blue700,border:`1.5px solid ${C.blue700}`},
    ghost:   {background:C.gray100,color:C.gray700},
    danger:  {background:C.red100,color:C.red600},
    success: {background:C.green100,color:C.green600},
  }
  return <button onClick={onClick} disabled={disabled} style={{...base,...vs[v]}}>{children}</button>
}

export function Inp({ value, onChange, placeholder, style = {} }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; style?: CSSProperties
}) {
  return <input value={value} onChange={onChange} placeholder={placeholder} style={{padding:"9px 12px",border:`1.5px solid ${C.gray200}`,borderRadius:8,fontSize:13,color:C.gray900,outline:"none",background:C.white,...style}}/>
}

export function Sel({ value, onChange, options, style = {} }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: string[]; style?: CSSProperties
}) {
  return (
    <select value={value} onChange={onChange} style={{padding:"9px 12px",border:`1.5px solid ${C.gray200}`,borderRadius:8,fontSize:13,color:C.gray900,background:C.white,...style}}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )
}

export function StatCard({ num, label, delta, pos, accent, icon }: {
  num: string|number; label: string; delta?: string; pos?: boolean; accent: string; icon?: string
}) {
  return (
    <div style={{background:C.white,border:`1px solid ${C.gray200}`,borderRadius:14,padding:"20px 22px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
      <div>
        <div style={{fontSize:13,color:C.gray500,marginBottom:8,fontWeight:500}}>{label}</div>
        <div style={{fontSize:32,fontWeight:800,color:C.gray900,lineHeight:1}}>{num}</div>
        {delta && (
          <div style={{fontSize:12,marginTop:8,color:pos?C.green600:C.amber600,fontWeight:600}}>
            {pos ? "+" : "⚠ "}{delta}
          </div>
        )}
      </div>
      {icon && (
        <div style={{width:44,height:44,borderRadius:12,background:`${accent}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>
          {icon}
        </div>
      )}
    </div>
  )
}
