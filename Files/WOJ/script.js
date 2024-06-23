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

    // Fetch last tick time
    fetch('https://elitebgs.app/api/ebgs/v5/ticks')
        .then(response => response.json())
        .then(data => {
            const timestamp = data[0].time; // Assuming the timestamp is provided in UTC format like "2024-06-11T01:12:35.000Z"
            const date = new Date(timestamp);
            const localDateTimeString = date.toLocaleString();
            document.getElementById('infoButton').textContent = `Last Tick: ${localDateTimeString}\n(Your Local Time)`;
        })
        .catch(error => {
            console.error('Error fetching last tick:', error);
            document.getElementById('infoButton').textContent = 'Failed to fetch last tick';
        });

    // Show custom input fields based on selection
    document.getElementById('searchWordSelect1').addEventListener('change', function() {
        var searchWord = document.getElementById('searchWord');
        if (this.value === 'custom') {
            searchWord.style.display = 'block';
            searchWord.required = true;
        } else {
            searchWord.style.display = 'none';
            searchWord.required = false;
        }
    });

    document.getElementById('searchWordSelect2').addEventListener('change', function() {
        var replaceWord2Input = document.getElementById('replaceWord2');
        if (this.value === 'custom') {
            replaceWord2Input.style.display = 'block';
            replaceWord2Input.required = true;
        } else {
            replaceWord2Input.style.display = 'block'; // Always show the replaceWord2 input
            replaceWord2Input.required = false;
        }
    });

    // Form submission handling
    document.getElementById('wordReplacerForm').addEventListener('submit', function(event) {
        event.preventDefault();

        var text = document.getElementById('wordSetSelect').value;

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

    // Copy replaced text to clipboard
    document.getElementById('copyButton').addEventListener('click', function() {
        var outputText = document.getElementById('output').textContent;
        navigator.clipboard.writeText(outputText).then(function() {
            console.log('Text copied to clipboard');
        }).catch(function(error) {
            console.error('Error copying text:', error);
        });
    });

    // Copy title with replaced values to clipboard
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
