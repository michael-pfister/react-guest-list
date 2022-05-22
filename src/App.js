import './App.css';
import { useEffect, useState } from 'react';

const baseUrl = 'https://react-guest-list-database.herokuapp.com';

class Guest {
  constructor(id, firstName, lastName, attending) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.attending = attending;
  }
}

function Form({ guestList, setGuestList }) {
  const [nameValue, setNameValue] = useState(new Guest('', '', ''));

  return (
    <div>
      <label htmlFor="firstName">First name</label>
      <input
        id="firstName"
        value={nameValue.firstName}
        onChange={(event) => {
          setNameValue(new Guest('', event.target.value, nameValue.lastName));
        }}
      />
      <br />
      <label htmlFor="lastName">Last name</label>
      <input
        id="lastName"
        value={nameValue.lastName}
        onChange={(event) => {
          setNameValue(new Guest('', nameValue.firstName, event.target.value));
        }}
        onKeyDown={(event) => {

          if (event.key === 'Enter') {
            let firstName = nameValue.firstName;
            let lastName = nameValue.lastName;

            // update database and adapt local guestList afterwards
            fetch(`${baseUrl}/guests`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ firstName, lastName }),
            }).then(()=>{
              fetch(`${baseUrl}/guests`).then((resolve)=>{
                resolve.json().then((resolve)=>{
                  let newGuestList = new Array();
                  for (let index in resolve){
                    newGuestList.push(new Guest(resolve[index].id, resolve[index].firstName, resolve[index].lastName, resolve[index].attending));
                  }
                  setGuestList(newGuestList);
                });
              });
            });

            setNameValue(new Guest('', '', ''));
          }
        }}
      />
    </div>
  );
}

function RemoveGuest(guestList, setGuestList, guest){
  setGuestList(
    guestList.filter((element) => {
      return element !== guest;
    }),
  );

  // update database
  fetch(`${baseUrl}/guests/${guest.id}`, { method: 'DELETE' });
}

function setAttendance(guestList, setGuestList, guest) {
  setGuestList(
    guestList.map((element) => {
      if (element === guest) {
        element.attending = !element.attending;
      }

      return element;
    }),
  );

  // update database
  let attending = guest.attending;
  fetch(`${baseUrl}/guests/${guest.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ attending }),
  });
}

function ControlingUnit({ guestList, setGuestList, guest }) {
  return (
    <div>
      <input
        type="checkbox"
        aria-label="attending"
        onChange={() => {
          setAttendance(guestList, setGuestList, guest);
        }}
        checked={guest.attending}
      />
      <br />
      <button
        aria-label="Remove"
        onClick={() => {
          RemoveGuest(guestList, setGuestList, guest);
        }}
      >
        Remove
      </button>
    </div>
  );
}

function GuestList({ guestList, setGuestList }) {
  return (
    <div data-test-id="guest">
      {guestList.map((guest) => {
        return (
          <div key={guestList.indexOf(guest)}>
            {/* rework this to unique keys, id is causing problems (removing guest 0 => guest[1] gets key 0) */}
            <hr />
            <span>{guest.firstName}</span>
            <br />
            <span>{guest.lastName}</span>
            <br />
            <span>{guest.attending.toString()}</span>
            <br />
            <ControlingUnit
              guestList={guestList}
              setGuestList={setGuestList}
              guest={guest}
            />
          </div>
        );
      })}
    </div>
  );
}

function App() {
  const [guestList, setGuestList] = useState([]);

  // initialize guestList
  useEffect(()=>{
    fetch(`${baseUrl}/guests`).then((resolve)=>{
      resolve.json().then((resolve)=>{
        let newGuestList = new Array();
        for (let index in resolve){
          newGuestList.push(new Guest(resolve[index].id, resolve[index].firstName, resolve[index].lastName, resolve[index].attending));
        }
        setGuestList(newGuestList);
      });
    });
  },[]);



  return (
    <div className="App">
      <main>
        <Form guestList={guestList} setGuestList={setGuestList} />
        <GuestList guestList={guestList} setGuestList={setGuestList} />
      </main>
    </div>
  );
}

export default App;
