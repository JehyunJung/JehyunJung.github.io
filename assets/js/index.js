const enterButton=document.getElementById("enterButton");
function handleClickEvent(){
    const url=`${window.location.href}categories/`;
    window.location.href=url;
}

enterButton.addEventListener("click",handleClickEvent);