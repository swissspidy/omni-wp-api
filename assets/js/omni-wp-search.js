window.addEventListener('DOMContentLoaded', event => {
    const form = document.getElementById('omni_search_form');
    const button = document.getElementById('get_results');
    const resultsDiv = document.getElementById('results');

    const autocompleteResultsDiv = document.getElementById('query_autocomplete');
    const autocompleteResultsList = document.createElement('ul'); // this should be your dropdown div
    autocompleteResultsDiv.append(autocompleteResultsList);
    const limit = parseInt(omni_ajax.answers_per_page);
    let offset = 0;

    document.getElementById('query').addEventListener('keyup', async function (e) {
        const inputVal = this.value;

        autocompleteResultsDiv.style.display = 'block'; // clear the dropdown
        if (inputVal.length === 0) {
            autocompleteResultsList.innerHTML = ''; // clear the dropdown
            return false;
        }

        const postData = new URLSearchParams({
            'action': 'omni_handle_autocomplete',
            'query': inputVal,
            'nonce': omni_ajax.autocomplete_nonce
        });

        if (e.key === 'Enter') {
            const firstItem = autocompleteResultsList.querySelector('li');
            if (firstItem) {
                document.getElementById('query').value = firstItem.textContent;
                firstItem.click();
            }
            autocompleteResultsList.innerHTML = ''; // clear the dropdown after selection
            return false;
        }

        try {
            const response = await fetch(omni_ajax.url, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: postData
            });
            const data = await response.json();
            autocompleteResultsList.innerHTML = '';  // clear the dropdown

            if (data.success) {
                if (data.data.length === 0) {
                    autocompleteResultsDiv.style.display = 'none';
                }
                data.data.forEach(item => {
                    // assuming each item in the result has 'title' and 'url'
                    // create a new list item for each result
                    const li = document.createElement('li');
                    li.append(item.text);
                    autocompleteResultsList.appendChild(li);
                });

            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    autocompleteResultsList.addEventListener('click', function (e) {
        if (e.target && e.target.nodeName === 'LI') {
            document.getElementById('query').value = e.target.textContent; // update input value to selected item
            autocompleteResultsList.innerHTML = '';
            autocompleteResultsDiv.style.display = 'none';
        }
    });

    const searchFunc = async function () {

        const query = document.getElementById('query').value;
        if (query.length === 0)
            return false;

        buttonDisabledState(true, '<span class="spin dashicons dashicons-update"></span>');

        const postData = new URLSearchParams({
            'action': 'omni_search_handle_query',
            'query': query,
            'offset': offset,
            'limit': limit,
            'nonce': omni_ajax.query_nonce,
        });

        try {
            const response = await fetch(omni_ajax.url, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: postData
            });
            const data = await response.json();
            // Clear existing results
            resultsDiv.innerHTML = '';

            if (data.success) {
                console.log(data.data);
                buttonDisabledState(false, omni_ajax._search);
                updateResultsDiv(data);

            } else {
                resultsDiv.textContent = 'An error occurred while fetching data.';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const buttonDisabledState = function (state, text) {
        state ? button.setAttribute('disabled', true) : button.removeAttribute('disabled');
        button.innerHTML = text;

    }

    const createElement = function (element, text) {
        const newElement = document.createElement(element);
        newElement.textContent = text;

        return newElement;
    }

    const updateResultsDiv = function (data) {

        data.data.forEach(item => {
            const div = document.createElement('div');

            let title = createElement('h3');
            let link = createElement('a', item.title);
            link.href = item.url;
            title.append(link);
            div.append(title);
            console.log(omni_ajax.show_content !== 0);
            if (omni_ajax.show_content !== '0') {
                div.append(createElement('p', item.short_description));
            }
            resultsDiv.appendChild(div);
        });
    }

    const updateButtonVisibility = function (data) {
        const numOfResults = data.data.length;
        prevButton.style.display = offset <= 0 ? 'none' : 'inline';
        nextButton.style.display = numOfResults < limit ? 'none' : 'inline';
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        searchFunc();
    });

});