const e=document.querySelectorAll("section"),t=document.querySelectorAll(".nav-menu a"),c=new IntersectionObserver((e=>{e.forEach((e=>{if(e.isIntersecting){t.forEach((e=>e.classList.remove("active")));const c=e.target.id,r=document.querySelector(`.nav-menu a[href="#${c}"]`);r&&r.classList.add("active")}}))}),{threshold:.5});e.forEach((e=>c.observe(e)));
//# sourceMappingURL=index.879e867d.js.map
