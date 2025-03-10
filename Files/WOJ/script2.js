document.addEventListener('DOMContentLoaded', function() {
    // Fetch missions and populate dropdown
    fetch('missions.json')
    .then(response => response.json())
    .then(data => {
        const missionSelect = document.getElementById('wordSetSelect');
        data.missions.forEach(mission => {
            const option = document.createElement('option');
            option.value = mission.value; // Use the raw value directly
            option.textContent = `${mission.type}`; // Display only the type
            option.dataset.title = mission.title; // Store the title in a data attribute
            missionSelect.appendChild(option);
        });
        document.getElementById('customTextInput').style.display = 'none';
        document.getElementById('wordSetSelect').style.display = 'block';
        document.getElementById('toggleButton').textContent = 'Use Custom Input';
    })
    .catch(error => console.error('Error fetching missions:', error));

    // Fetch last tick time (existing code remains unchanged)
    fetch('https://elitebgs.app/api/ebgs/v5/ticks')
        .then(response => response.json())
        .then(data => {
            const timestamp = data[0].time;
            const date = new Date(timestamp);
            const localDateTimeString = date.toLocaleString();

            const now = new Date();
            const timeDiff = Math.abs(now - date);
            const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
            const diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

            let timeAgo = '';
            if (diffHours > 0) {
                timeAgo = `${diffHours}hrs ago`;
            } else if (diffMinutes > 0) {
                timeAgo = `${diffMinutes}mins ago`;
            } else {
                timeAgo = `${diffSeconds}secs ago`;
            }

            document.getElementById('infoButton').textContent = `Last Tick: ${localDateTimeString}\n\n(${timeAgo})`;
        })
        .catch(error => {
            console.error('Error fetching last tick:', error);
            document.getElementById('infoButton').textContent = 'Failed to fetch last tick';
        });

    // Function to add or modify the dates in the mission text
    function addDatesToMissionText(text) {
        // Get the current date
        let currentDate = new Date();

        // Check if the pending checkbox is checked
        const isPending = document.getElementById('pendingCheckbox').checked;

        // If pending is checked, add one day to the current date
        if (isPending) {
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Format the start date as needed (e.g., "MM/DD/YYYY")
        const formattedStartDate = currentDate.toLocaleDateString();

        // Calculate the end date (7 days after the start date)
        let endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 7);
        const formattedEndDate = endDate.toLocaleDateString();

        // Replace the {dateofmission} placeholder with the formatted start date
        // Replace the {enddateofmission} placeholder with the formatted end date
        return text
            .replace(/{dateofmission}/g, formattedStartDate)
            .replace(/{enddateofmission}/g, formattedEndDate);
    }

    // Add event listener to the form submit event
    document.getElementById('wordReplacerForm').addEventListener('submit', function(event) {
        event.preventDefault();

        var text = document.getElementById('wordSetSelect').value;

        // Replace {dateofmission} and {enddateofmission} in the text
        text = addDatesToMissionText(text);

        var searchWordSelect1 = document.getElementById('searchWordSelect1').value;
        var replaceWord1 = document.getElementById('replaceWord1').value;

        var searchWordSelect2 = document.getElementById('searchWordSelect2').value;
        var replaceWord2 = document.getElementById('replaceWord2').value;

        var regex1 = new RegExp(searchWordSelect1, 'g');
        var replacedText1 = text.replace(regex1, replaceWord1);

        // Replace {factionname} with default if replaceWord2 is empty
        var defaultFactionName = 'Wolves Of Jonai';
        var regex2 = new RegExp(searchWordSelect2, 'g');
        var replacedText2 = replacedText1.replace(regex2, replaceWord2 || defaultFactionName);

        document.getElementById('output').textContent = replacedText2;

        // Extract the title from the data attribute of the selected option
        var selectedOption = document.getElementById('wordSetSelect').selectedOptions[0];
        var missionTitle = selectedOption ? selectedOption.dataset.title : '';
        
        // Insert [PENDING] after the first bracketed segment ([INF])
        if (document.getElementById('pendingCheckbox').checked) {
            var firstBracketEnd = missionTitle.indexOf(']') + 1;
            missionTitle = missionTitle.slice(0, firstBracketEnd) + ' [PENDING]' + missionTitle.slice(firstBracketEnd);
        }

        document.getElementById('titleOutput').textContent = missionTitle;
    });

    // Copy replaced text to clipboard (existing code)
    document.getElementById('copyButton').addEventListener('click', function() {
        var outputText = document.getElementById('output').textContent;
        navigator.clipboard.writeText(outputText).then(function() {
            console.log('Text copied to clipboard');
        }).catch(function(error) {
            console.error('Error copying text:', error);
        });
    });

    // Copy title with replaced values to clipboard (existing code)
    document.getElementById('copyTitleButton').addEventListener('click', function() {
        var selectedOption = document.getElementById('wordSetSelect').selectedOptions[0];
        var titleTemplate = selectedOption ? selectedOption.dataset.title : '';

        var searchWordSelect2 = document.getElementById('searchWordSelect2').value;
        var replaceWord2 = document.getElementById('replaceWord2').value;

        var defaultFactionName = 'Wolves Of Jonai';

        // Replace {factionname} with default if replaceWord2 is empty
        var replacedTitle = titleTemplate.replace(new RegExp(searchWordSelect2, 'g'), replaceWord2 || defaultFactionName);

        var searchWordSelect1 = document.getElementById('searchWordSelect1').value;
        var replaceWord1 = document.getElementById('replaceWord1').value;

        var regex1 = new RegExp(searchWordSelect1, 'g');
        var replacedText1 = replacedTitle.replace(regex1, replaceWord1 || defaultFactionName);

        // Insert [PENDING] after the first bracketed segment ([INF])
        if (document.getElementById('pendingCheckbox').checked) {
            var firstBracketEnd = replacedText1.indexOf(']') + 1;
            replacedText1 = replacedText1.slice(0, firstBracketEnd) + ' [PENDING]' + replacedText1.slice(firstBracketEnd);
        }

        navigator.clipboard.writeText(replacedText1).then(function() {
            console.log('Title copied to clipboard');
            document.getElementById('copyTitleButton').classList.add('copy-animation');
            setTimeout(() => {
                document.getElementById('copyTitleButton').classList.remove('copy-animation');
            }, 1100);
        }).catch(function(error) {
            console.error('Error copying title:', error);
        });
    });
        // Add event listener for copying the system name
        document.getElementById('copySystemNameButton').addEventListener('click', function() {
            var systemName = document.getElementById('replaceWord1').value; // Get the system name value
            if (systemName) {
                navigator.clipboard.writeText(systemName).then(function() {
                    console.log('System name copied to clipboard');
                }).catch(function(error) {
                    console.error('Error copying system name:', error);
                });
            } else {
                console.error('System name is empty');
            }
        });

    // Initial setup based on default selection
    var searchWordSelect2 = document.getElementById('searchWordSelect2').value;
    var replaceWord2Input = document.getElementById('replaceWord2');
    
    if (searchWordSelect2 === 'custom') {
        replaceWord2Input.style.display = 'block';
        replaceWord2Input.required = true;
    } else {
        replaceWord2Input.style.display = 'block'; // Ensure this is set to 'block' initially
        replaceWord2Input.required = false;
    }
});
// Your existing script code...

// Function to fetch server status
function fetchServerStatus() {
    fetch('https://ed-server-status.orerve.net/')
        .then(response => response.json())
        .then(data => {
            const serverStatusElement = document.getElementById('serverStatus');

            if (data.status === 'Good') {
                serverStatusElement.innerHTML = 'Server status: <span class="status-online">Good</span>';
            } else {
                serverStatusElement.innerHTML = 'Server status: <span class="status-offline">Unavailable</span>';
            }
        })
        .catch(() => {
            document.getElementById('serverStatus').innerHTML = 'Error fetching server status';
        });
}

// Call the function to fetch server status when needed, e.g., when the page loads:
fetchServerStatus(); // This will trigger the function immediately after the script is loaded

