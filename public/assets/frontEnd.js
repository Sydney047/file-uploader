const hidden = document.querySelector( '#newFile'  );
const dropArea = document.querySelector( '.uploadFileLabel' );
const shareBtn = document.querySelector( '.shareBtn' );

if ( dropArea ) {
    dropArea.addEventListener( 'click', () => {
        hidden.click();
    });

    dropArea.addEventListener( 'dragover', event => {   
        event.preventDefault();
    }); 

    dropArea.addEventListener( 'drop', event => {
        event.preventDefault();

        const files = event.dataTransfer.files;
        if( files.length > 0 ) {
            fileUpload( files[0] );
        } else {
            alert( 'No file selected' );    
        }
    });

    hidden.addEventListener( 'change', event=> {
        if( event.target.files.length > 0   ) {
        fileUpload( event.target.files[0] ); 
        } 
    })

    fileUpload = ( file ) => {
        const fileNameField = document.querySelector( '.fileNameField' );
        fileNameField.textContent = file.name;
    }
}

if ( shareBtn ) {
    shareBtn.addEventListener( 'click', () => { 
        const url = shareBtn.dataset.shareUrl;
        const fileName = shareBtn.dataset.fileName;

        if ( navigator.share) {
            navigator.share({
                title: 'Sharing File',
                text: `Check out this file: ${fileName}`,
                url: url
            });
        } else {
            navigator.clipboard.writeText( url )    
            alert( 'Link copied to clipboard' );
        }
    })
}