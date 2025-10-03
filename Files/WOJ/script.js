document.addEventListener('DOMContentLoaded', function() {
    // Fetch missions and populate dropdown
    fetch('./missions.json') // Use relative path
    .then(response => response.json())
    .then(data => {
        const missionSelect = document.getElementById('wordSetSelect');
        missionSelect.innerHTML = ''; // Clear previous options
        data.missions.forEach(mission => {
            const option = document.createElement('option');
            option.value = mission.id;
            option.textContent = `${mission.type} [${mission.id}]`;
            option.dataset.title = mission.title;
            option.dataset.value = mission.value;
            missionSelect.appendChild(option);
        });
        document.getElementById('customTextInput').style.display = 'none';
        missionSelect.style.display = 'block';
        // Dispatch the event so index.html can react to it
        document.dispatchEvent(new Event('missionsLoaded'));
    })
    .catch(error => console.error('Error fetching missions:', error));

    fetch('https://api.allorigins.win/raw?url=http://tick.infomancer.uk/galtick.json')
    .then(response => response.json())
    .then(data => {
        console.log("Fetched tick data:", data); // Debugging log

        // Attempt to extract the timestamp from known structures
        const timestamp = data.lastGalaxyTick || (Array.isArray(data) && data[0]?.time);
        
        if (!timestamp) throw new Error("No valid tick timestamp found.");

        const date = new Date(timestamp);
        if (isNaN(date.getTime())) throw new Error("Invalid tick date format.");

        const localDateTimeString = date.toLocaleString();

        // Calculate time difference
        const now = new Date();
        const timeDiff = Math.abs(now - date);
        const diffHours = Math.floor(timeDiff / (1000 * 60 * 60));
        const diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        let timeAgo = diffHours > 0 ? `${diffHours}hrs ago` : 
                      diffMinutes > 0 ? `${diffMinutes}mins ago` : 
                      `${diffSeconds}secs ago`;

        document.getElementById('infoButton').textContent = `Last Tick: ${localDateTimeString} (${timeAgo})`;
    })
    .catch(error => {
        console.error('⚠️ Error fetching last tick:', error);
        document.getElementById('infoButton').textContent = '⏰ Failed to fetch last tick';
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

        // Use the mission text from the selected option's data-value attribute
        var selectedOption = document.getElementById('wordSetSelect').selectedOptions[0];
        var text = selectedOption ? selectedOption.dataset.value : '';

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
        var titleTemplate = selectedOption ? selectedOption.dataset.title : '';

        var searchWordSelect2 = document.getElementById('searchWordSelect2').value;
        var replaceWord2 = document.getElementById('replaceWord2').value;
        var defaultFactionName = 'Wolves Of Jonai';
        var replacedTitle = titleTemplate.replace(new RegExp(searchWordSelect2, 'g'), replaceWord2 || defaultFactionName);

        var searchWordSelect1 = document.getElementById('searchWordSelect1').value;
        var replaceWord1 = document.getElementById('replaceWord1').value;
        var regex1 = new RegExp(searchWordSelect1, 'g');
        var replacedTitleFinal = replacedTitle.replace(regex1, replaceWord1 || defaultFactionName);

        // Insert [PENDING] after the first bracketed segment ([INF])
        if (document.getElementById('pendingCheckbox').checked) {
            var firstBracketEnd = replacedTitleFinal.indexOf(']') + 1;
            replacedTitleFinal = replacedTitleFinal.slice(0, firstBracketEnd) + ' [PENDING]' + replacedTitleFinal.slice(firstBracketEnd);
        }

        document.getElementById('titleOutput').textContent = replacedTitleFinal;

        // Show persistent notification with replaced mission title
        var notification = document.getElementById('notification');
        notification.innerHTML = `<strong>Mission created:</strong> <span style="color:#fff">${replacedTitleFinal}</span><br>You can now copy the title & full mission with the buttons below`;
        notification.style.display = "block";
    });

    // Copy replaced text to clipboard (existing code)
    document.getElementById('copyButton').addEventListener('click', function() {
        var outputText = document.getElementById('output').textContent;
        navigator.clipboard.writeText(outputText).then(function() {
            console.log('Text copied to clipboard');
            // Add animation
            var btn = document.getElementById('copyButton');
            btn.classList.add('copy-animation');
            setTimeout(() => {
                btn.classList.remove('copy-animation');
            }, 1100);
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
            var btn = document.getElementById('copyTitleButton');
            btn.classList.add('copy-animation');
            setTimeout(() => {
                btn.classList.remove('copy-animation');
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
                // Add animation
                var btn = document.getElementById('copySystemNameButton');
                btn.classList.add('copy-animation');
                setTimeout(() => {
                    btn.classList.remove('copy-animation');
                }, 1100);
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

    // Function to fetch server status
    function fetchServerStatus() {
        fetch('https://ed-server-status.orerve.net/')
            .then(response => response.json())
            .then(data => {
                const serverStatusElement = document.getElementById('serverStatus');
                let statusText = data.status || 'Unknown';
                serverStatusElement.textContent = `Server Status: ${statusText}`;
            })
            .catch(() => {
                document.getElementById('serverStatus').textContent = 'Error fetching server status';
            });
    }

    // Call the function to fetch server status when needed, e.g., when the page loads:
    fetchServerStatus();

    // Fetch system names and populate datalist
    fetch('https://sirsuperdeath.github.io/Files/WOJ/jsons/whitelist.txt')
    .then(response => response.text())
    .then(text => {
        const datalist = document.getElementById('systemList');
        datalist.innerHTML = '';
        text.split('\n').map(line => line.trim()).filter(line => line).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            datalist.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching systems:', error));
});

