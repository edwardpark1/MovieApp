const closeButton = document.querySelector('#close-button');
const mobileButton = document.querySelector('#mobile-button');
const copyrightYear = document.querySelector('#edp-copyright');

copyrightYear.textContent = getCopyrightYear();

closeButton.addEventListener('click', toggleDesktopMenu);
mobileButton.addEventListener('click', toggleDesktopMenu);

function toggleDesktopMenu() {
    document.querySelector('#desktop-panel').classList.toggle('menu-move');
}

function getCopyrightYear() {
    return (new Date()).getFullYear();
}