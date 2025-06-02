// Style swapper with Material Icons
document.getElementById('swapStyleButton').addEventListener('click', function() {
    var link = document.getElementById('themeStylesheet');
    var icon = document.getElementById('swapStyleIcon');
    if (link.getAttribute('href') === 'styles1.css') {
        link.setAttribute('href', 'styles.css');
        icon.textContent = 'sunny';
    } else {
        link.setAttribute('href', 'styles1.css');
        icon.textContent = 'dark_mode';
    }
});
// Set initial icon based on stylesheet
window.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('themeStylesheet');
    var icon = document.getElementById('swapStyleIcon');
    icon.textContent = link.getAttribute('href') === 'styles1.css' ? 'dark_mode' : 'sunny';
});
