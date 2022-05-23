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

function Form({ setGuestList, loading }) {
  const [nameValue, setNameValue] = useState(new Guest('', '', ''));

  return (
    <div className="Form">
      <div className="inputField">
        <label htmlFor="firstName">First name</label>
        <input
          id="firstName"
          value={nameValue.firstName}
          onChange={(event) => {
            setNameValue(new Guest('', event.target.value, nameValue.lastName));
          }}
          disabled={loading}
        />
      </div>
      <div className="inputField">
        <label htmlFor="lastName">Last name</label>
        <input
          id="lastName"
          value={nameValue.lastName}
          onChange={(event) => {
            setNameValue(
              new Guest('', nameValue.firstName, event.target.value),
            );
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              const firstName = nameValue.firstName;
              const lastName = nameValue.lastName;

              // update database and adapt local guestList afterwards
              fetch(`${baseUrl}/guests`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName }),
              })
                .then(() => {
                  fetch(`${baseUrl}/guests`)
                    .then((resolve) => {
                      resolve
                        .json()
                        .then((json) => {
                          const newGuestList = [];
                          for (const index in json) {
                            newGuestList.push(
                              new Guest(
                                json[index].id,
                                json[index].firstName,
                                json[index].lastName,
                                json[index].attending,
                              ),
                            );
                          }
                          setGuestList(newGuestList);
                        })
                        .catch((reject) => {
                          throw reject;
                        });
                    })
                    .catch((reject) => {
                      throw reject;
                    });
                })
                .catch((reject) => {
                  throw reject;
                });

              setNameValue(new Guest('', '', ''));
            }
          }}
          disabled={loading}
        />
      </div>
    </div>
  );
}

function RemoveGuest(guestList, setGuestList, guest) {
  setGuestList(
    guestList.filter((element) => {
      return element !== guest;
    }),
  );

  // update database
  fetch(`${baseUrl}/guests/${guest.id}`, { method: 'DELETE' }).catch(
    (reject) => {
      throw reject;
    },
  );
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
  const attending = guest.attending;
  fetch(`${baseUrl}/guests/${guest.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ attending }),
  }).catch((reject) => {
    throw reject;
  });
}

function ControlingUnit({ guestList, setGuestList, guest }) {
  return (
    <div className="ControlingUnit">
      <input
        className="CheckBox"
        type="checkbox"
        aria-label="attending"
        onChange={() => {
          setAttendance(guestList, setGuestList, guest);
        }}
        checked={guest.attending}
      />
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

function GuestList({ guestList, setGuestList, loading }) {
  if (loading) {
    return <p>Loading...</p>;
  } else {
    return (
      <div data-test-id="guest" className="GuestList">
        {guestList.map((guest) => {
          return (
            <div key={guestList.indexOf(guest)}>
              {/* rework this to unique keys, id is causing problems (removing guest 0 => guest[1] gets key 0) */}
              <hr />
              <span>
                {guest.firstName} {guest.lastName}
              </span>
              <br />
              {guest.attending ? (
                <span>attending</span>
              ) : (
                <span>not attending</span>
              )}
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
}

function App() {
  const [guestList, setGuestList] = useState([]);
  const [loading, setLoading] = useState(false);

  // initialize guestList
  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/guests`)
      .then((resolve) => {
        resolve
          .json()
          .then((json) => {
            const newGuestList = [];
            for (const index in json) {
              newGuestList.push(
                new Guest(
                  json[index].id,
                  json[index].firstName,
                  json[index].lastName,
                  json[index].attending,
                ),
              );
            }
            setGuestList(newGuestList);
            setLoading(false);
          })
          .catch((reject) => {
            throw reject;
          });
      })
      .catch((reject) => {
        throw reject;
      });
  }, []);

  return (
    <div className="App">
      <main>
        <header>
          <h1>React Guest List</h1>
        </header>
        <Form
          guestList={guestList}
          setGuestList={setGuestList}
          loading={loading}
        />
        <GuestList
          guestList={guestList}
          setGuestList={setGuestList}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;
