// fileManagement.js

let uploadedFile;
let metadataCount = 1;
let allMetadata = [];

function handleFileUpload() {
    const fileInput = document.getElementById('uploadBtn');
    uploadedFile = fileInput.files[0];
}

function toggleMetadataForm() {
    const metadataForm = document.getElementById('metadataForm');
    metadataForm.style.display = metadataForm.style.display === 'none' ? 'block' : 'none';
}

function addMetadata() {
    const metadataField = createMetadataField(`metadataField${metadataCount}`);
    metadataCount++;
    document.getElementById('metadataForm').insertBefore(metadataField, document.getElementById('addMetadataBtn'));
}

 function confirmMetadata() {

    const fileIdInput = document.getElementById('fileId');
    const fileId = fileIdInput.value.trim();
    const valueInput = document.getElementById('value');
    const value = valueInput.value.trim();

    if (value === '') {
        showMessage('Please enter the value of the unique ID.', true);
        return false;
    } else {
        const existingIndex = allMetadata.findIndex(item => item.key === fileId);

        if (existingIndex !== -1) {
            allMetadata[existingIndex].value = value;
        } else {
            allMetadata.push({ key: fileId, value: value });
        }

        let keyInputs;
        let valueInputs;

        for (let i = 1; i < metadataCount; i++) {
            keyInputs = document.getElementById(`keyInput${i}`);
            valueInputs = document.getElementById(`valueInput${i}`);
            const existingIndex = allMetadata.findIndex(item => item.key === keyInputs.value.trim());

            if (existingIndex !== -1) {
                allMetadata[existingIndex].value = valueInputs.value.trim();
            } else {
                allMetadata.push({ key: keyInputs.value.trim(), value: valueInputs.value.trim() });
            }
        }
        showMessage('Metadata confirmed successfully!', false);
        return true;
    }


}

function uploadFile() {
    const metadataConfirmed = confirmMetadata();
    if(metadataConfirmed) {
        if (uploadedFile) {
            showMessage('The file is being uploaded...',false);
            const formData = new FormData();
            formData.append('file', uploadedFile);
            const allMetadataString = JSON.stringify(allMetadata);
            formData.append('allMetadata', allMetadataString);
            const requestOptions = {
                method: 'POST',
                body: formData,
            };

            fetch('http://localhost:3000/upload', requestOptions)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage(data.success, false);
                    } else {
                        if (data.error === 'Unique ID already exist!') {
                            showMessage(`Error: ${data.error}`, true);
                            showYesNoQuestion();
                        } else {
                            showMessage(`Error: ${data.error}`, true);
                        }
                    }
                })
                .catch(error => {
                    showMessage(`Error: ${error}`, true);
                });
        } else {
            showMessage("No file selected!", true);
        }
    }

}
function overwrite() {
    resetForm();
    if (uploadedFile) {
        showMessage('The file is being overwritten...')
        const formData = new FormData();
        formData.append('file', uploadedFile);
        const allMetadataString = JSON.stringify(allMetadata);
        formData.append('allMetadata', allMetadataString);
        const requestOptions = {
            method: 'POST',
            body: formData,
        };

        fetch('http://localhost:3000/overwrite', requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage(data.success, false);
                }
                else {
                        showMessage(`Error: ${data.error}`, true);
                    }
            })
            .catch(error => {
                showMessage(`Error: ${error}`, true);
            });
    } else {
        showMessage("No file selected!",true);
    }
}

function updtadeMetadata(){
    const metadataConfirmed = confirmMetadata();
    if(metadataConfirmed){
        if(metadataCount > 1) {
            showMessage('The file is being updated...', false)
            const formData = new FormData();
            const allMetadataString = JSON.stringify(allMetadata);
            formData.append('allMetadata', allMetadataString);
            const requestOptions = {
                method: 'POST',
                body: formData,
            };

            fetch('http://localhost:3000/update_metadata', requestOptions)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage(data.success, false);
                    } else {
                        showMessage(`Error: ${data.error}`, true);
                    }
                })
                .catch(error => {
                    showMessage(`Error: ${error}`, true);
                });
        }
        else {
            showMessage('Add at least one metadata field in addition to the one with the unique id', true);
        }
    }

}
function deleteFile(){
    const metadataConfirmed = confirmMetadata();
    if(metadataConfirmed){
            showMessage('The file is being deleted...', false)
            const formData = new FormData();
        const allMetadataString = JSON.stringify(allMetadata);
            formData.append('allMetadata', allMetadataString);
            const requestOptions = {
                method: 'POST',
                body: formData,
            };

            fetch('http://localhost:3000/delete-file', requestOptions)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showMessage(data.success, false);
                    } else {
                        showMessage(`Error: ${data.error}`, true);
                    }
                })
                .catch(error => {
                    showMessage(`Error: ${error}`, true);
                });
    }

}

function createMetadataField(id) {
    const metadataField = document.createElement('div');
    metadataField.className = 'metadata-field';
    metadataField.id = id;

    const keyLabel = document.createElement('label');
    keyLabel.setAttribute('for', 'key');
    keyLabel.textContent = 'Key:';

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.name = 'key';
    keyInput.placeholder = 'Enter key';
    keyInput.required = true;
    keyInput.id = `keyInput${metadataCount}`

    const valueLabel = document.createElement('label');
    valueLabel.setAttribute('for', 'value');
    valueLabel.textContent = 'Value:';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.name = 'key';
    valueInput.placeholder = 'Enter value';
    valueInput.required = true;
    valueInput.id = `valueInput${metadataCount}`

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'removeMetadataBtn';
    removeBtn.innerText = '-';
    removeBtn.onclick = () => removeMetadataField(id);

    metadataField.appendChild(keyLabel);
    metadataField.appendChild(keyInput);
    metadataField.appendChild(valueLabel);
    metadataField.appendChild(valueInput);
    metadataField.appendChild(removeBtn);

    return metadataField;
}

function removeMetadataField(fieldId) {
    metadataCount--;
    const fieldToRemove = document.getElementById(fieldId);
    if (fieldToRemove) {
        fieldToRemove.remove();
    }
}
function resetForm() {
    const yesNoQuestionDiv = document.getElementById('yes-no-question');
    yesNoQuestionDiv.style.display = 'none';

    toggleMetadataForm();

}

function showMessage(message, isError) {
    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = message;
    messageArea.style.fontWeight = "bold";

    // Clear previous classes
    messageArea.classList.remove('error', 'success');

    // Add the appropriate class based on whether it's an error or not
    if (isError) {
        messageArea.classList.add('error');
    } else {
        messageArea.classList.add('success');
    }
}

function showYesNoQuestion() {
    const yesNoQuestionDiv = document.getElementById('yes-no-question');
    yesNoQuestionDiv.style.display = 'block';
}
