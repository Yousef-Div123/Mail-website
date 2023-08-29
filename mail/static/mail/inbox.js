document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('', '', '', '', '', false));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(Rrecipients, Rsubject, Rbody, Rdate, Rsender, isReplay) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if (isReplay === true){
    document.querySelector('#compose-recipients').value = Rrecipients;
    if(Rsubject.includes('RE:')){
      document.querySelector('#compose-subject').value = Rsubject;
    }
    else
    {
      document.querySelector('#compose-subject').value = `RE: ${Rsubject}`;
    }
    document.querySelector('#compose-body').value = `On ${Rdate} ${Rsender} wrote: 
    ${Rbody}`;
  }


  //When the form is submited
  document.querySelector("#submit-email").addEventListener('click', function() {
    let recipients = document.querySelector('#compose-recipients').value;
    let subject = document.querySelector('#compose-subject').value;
    let body = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    });
  })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';

  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  

  let emails_list = []
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // emails list
      document.querySelector('#single-email-view').style.display = 'none';
      for (email of emails){
        //changing the bg to gray if read
        if (email.read === true && mailbox !== 'sent'){
          background_color = 'lightgray';
        }
        else{
          background_color = 'white';
        }
        //adding or removing archive button 
        if(mailbox === 'inbox'){
          archive_button = `
            <div class = 'archive-button'>
              <button class="btn btn-sm btn-outline-primary" id='archive-${email.id}'>Archive</button>
            </div>
          </div>
          `;
        }
        else if(mailbox === 'archive')
        {
          archive_button = `
            <div class = 'archive-button'>
              <button class="btn btn-sm btn-outline-primary" id='archive-${email.id}'>Unarchive</button>
            </div>
          </div>
          `;
        }
        else
        {
          archive_button = "</div>";
        }
        let div = `
        <div  class = 'email' id = 'email-${email.id}' style = "background-color: ${background_color};">
          ${email.sender}
          <h1>${email.subject}</h1>
          <h6 class = 'date'>${email.timestamp}</h6>
          
        
        `;
        div += archive_button;
        document.querySelector('#emails-view').innerHTML += div;
        emails_list.push(email);

      }
      
      //viewing emails
      for (let i = 0; i < emails_list.length; i++){
        document.querySelector(`#email-${emails_list[i].id}`).addEventListener('click', function() {
          fetch(`/emails/${emails[i].id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        
        fetch(`/emails/${emails[i].id}`)
        .then(response => response.json())
        .then(email => {
            //clearing the page
            document.querySelector("#emails-view").innerHTML = '';
            document.querySelector("#single-email-view").innerHTML = '';
            document.querySelector('#single-email-view').style.display = 'block';
  
            //showing the email
            div = `
            <div>
              <strong>From</strong>:<h6>${emails[i].sender}</h6>
            </div>
            <div>
              <strong>To</strong>:<h6>${emails[i].recipients}</h6> 
            </div>
            <div>
              <strong>Subject</strong>:<h6>${emails[i].subject}</h6> 
            </div>
            <div>
              <strong>TimeStamp: </strong>${emails[i].timestamp}
            </div>
            <div class = 'email'>
              ${emails[i].body}
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary" id='reply-button'>Reply</button>
            </div>

            `
            document.querySelector('#single-email-view').innerHTML += div;

            document.querySelector(`#reply-button`).addEventListener("click", e =>{
              compose_email(emails[i].sender, emails[i].subject, emails[i].body, emails[i].timestamp, emails[i].sender, true);
            })
            
        });
      })
        
        //archived button function
        if (mailbox !== 'sent'){
          document.querySelector(`#archive-${emails_list[i].id}`).addEventListener('click', e => {
            e.stopPropagation();
            
            if(emails_list[i].archived === true){
              isArchived = false;
            }
            else
            {
              isArchived = true;
            }
            fetch(`/emails/${emails_list[i].id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived : isArchived
              })
                
            }, {capture : true})
            
            document.querySelector(`#archive-${emails_list[i].id}`).parentElement.parentElement.style.animationPlayState = 'running';
            document.querySelector(`#archive-${emails_list[i].id}`).parentElement.parentElement.addEventListener('animationend', function(){
              document.querySelector(`#email-${emails_list[i].id}`).remove();
            })
            

          })

        }

      }


  });

}