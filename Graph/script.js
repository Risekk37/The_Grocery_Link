document.addEventListener("DOMContentLoaded", () => {
    const chart = document.querySelector("#Chart");
    const infoGroups = {
      Chart_1: "PPN",
      Chart_2: "PSS",
      Chart_3: "PSV",
      Chart_4: "M",
      Chart_5: "G",
    };
  
    let activePolygon = null;
    let activeInfoGroup = null;
  
    Object.values(infoGroups).forEach(group => {
      const infoGroupElement = document.getElementById(group);
      if (infoGroupElement) {
        infoGroupElement.classList.remove("active");
        infoGroupElement.style.display = "none"; 
      }
    });
  
    chart.addEventListener("click", (event) => {
      const target = event.target;
      if (target.tagName !== "polygon") return;
  

      if (activePolygon) {
        activePolygon.classList.remove("active");
      }
      if (activeInfoGroup) {
        activeInfoGroup.classList.remove("active");
        activeInfoGroup.style.display = "none";  
      }
  
      target.classList.add("active");
      const infoGroupId = infoGroups[target.id];
      activeInfoGroup = document.getElementById(infoGroupId);
      if (activeInfoGroup) {
        activeInfoGroup.classList.add("active");
        activeInfoGroup.style.display = "block"; 
      }
  
      activePolygon = target;
    });
  });
