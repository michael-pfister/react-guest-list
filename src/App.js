import './App.css';
import { useEffect, useState } from 'react';

class Guest {
  firstName;
  lastName;
  attending = false;

  constructor(firstName, lastName) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

class DataBase {
  static dataBaseUrl = 'https://react-guest-list-database.herokuapp.com/';

  static getGuests(setGuestList) {
    fetch(this.dataBaseUrl + 'guests')
      .then((response) => {
        response
          .json()
          .then((json) => {
            setGuestList(
              json.map((element) => {
                const guest = new Guest(element.firstName, element.lastName);
                guest.attending = element.attending;
                return guest;
              }),
            );
            console.log(json);
          })
          .catch((error) => {
            throw error;
          });
      })
      .catch((error) => {
        throw error;
      });
  }

  static setGuests(guestList) {
    // delete all guests
    fetch(`${this.dataBaseUrl}guests`, {
      method: 'DELETE',
    }).catch((error) => {
      throw error;
    });

    // add every guest
    let guest = new Guest();
    let firstName = '';
    let lastName = '';
    let attending = false;

    for (guest of guestList) {
      // cannot refer to these values inside of fetch()
      firstName = guest.firstName;
      lastName = guest.lastName;
      attending = guest.attending;

      fetch(`${this.dataBaseUrl}guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, attending }),
      }).catch((error) => {
        throw error;
      });
    }
  }
}

function Form({ guestList, setGuestList }) {
  const [nameValue, setNameValue] = useState(new Guest('', ''));

  return (
    <div>
      <label htmlFor="firstName">First name</label>
      <input
        id="firstName"
        value={nameValue.firstName}
        onChange={(event) => {
          setNameValue(new Guest(event.target.value, nameValue.lastName));
        }}
      />
      <br />
      <label htmlFor="lastName">Last name</label>
      <input
        id="lastName"
        value={nameValue.lastName}
        onChange={(event) => {
          setNameValue(new Guest(nameValue.firstName, event.target.value));
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            setGuestList([
              ...guestList,
              new Guest(nameValue.firstName, nameValue.lastName),
            ]);
            setNameValue(new Guest('', ''));
          }
        }}
      />
    </div>
  );
}

function ControlingUnit({ guestList, setGuestList, guest }) {
  // Don't put functions inside of components because it will create a new instance of the function on every render
  function RemoveGuest() {
    setGuestList(
      guestList.filter((element) => {
        return element !== guest;
      }),
    );
  }

  function setAttendance() {
    setGuestList(
      guestList.map((element) => {
        if (element === guest) {
          element.attending = !element.attending;
        }

        return element;
      }),
    );
  }

  return (
    <div>
      <input
        type="checkbox"
        aria-label="attending"
        onChange={() => {
          setAttendance();
        }}
        checked={guest.attending}
      />
      <br />
      <button
        aria-label="Remove"
        onClick={() => {
          RemoveGuest();
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

  /* useEffect(() => {
    DataBase.getGuests(setGuestList);
  }, []);

  useEffect(() => {
    DataBase.setGuests(guestList);
  }, [guestList]); */

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
