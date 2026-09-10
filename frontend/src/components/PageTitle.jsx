import React from 'react'

function PageTitle({ title, sub }) {
  return (
    <div className="mt-1 mb-5">
      <h1 className="font-display font-extrabold text-2xl sm:text-[1.7rem] leading-tight">{title}</h1>
      {sub && <p className="text-sm text-soft mt-1.5">{sub}</p>}
      <div className="divider mt-3"></div>
    </div>
  )
}

export default PageTitle
