import React from "react"

interface PropsType {
    chatHistory: Array<Array<string>>;
}

export default function UserInformationForm(props : PropsType): JSX.Element  {

    const chatHistoryArr: Array<Array<string>> = props.chatHistory;
    // define the chat history string 
    const chatHistoryString: string = chatHistoryArr.map(chatHistory => chatHistory.join("\n\n")).join("\n");

    const handleSubmit = () => {
        const firstName = (document.getElementById("name1") as HTMLInputElement).value;
        const lastName = (document.getElementById("name2") as HTMLInputElement).value;
        const phoneNumber = (document.getElementById("phone") as HTMLInputElement).value;
        const email = (document.getElementById("email") as HTMLInputElement).value;

        const data = {
            source: "Finemyhome",
            type: "Property Inquiry",
            message: chatHistoryString,
            person: {
                firstName: firstName,
                lastName: lastName,
                source: "Finemyhome",
                sourceUrl: "http://findmyhome.io/",
                email: [{value: email}],
                phone: [{value: phoneNumber}],
                tags: ['RL_LEAD']
            }
        }
        const FOLLOW_UP_API_KEY = "fka_0YThbvnQZgIrRBWtJqCLqLCpsKajopTa3y";

        fetch('https://api.followupboss.com/v1/events', {
            method:'POST',
            headers:{
                Authorization:`Basic ${btoa(FOLLOW_UP_API_KEY)}`,
                "Content-Type": "application/json"
            },
            body : JSON.stringify(data)
            }
        ).then((response) => {
            if ( response.status === 201 ) {
                console.log('New contact has been created');
            } else if ( response.status === 200 ) {
                console.log('Existing contact updated.');
            } else {
                console.log(`Error, status code: ${response.status}`);
            }
            return response.json();
        }).then((data) => {
            console.log(data);
        }).catch((error) => {
            console.log("Fetch Error", error);
        });

    }

    return (
        <div className="overflow-hidden">
            <div className="w-full p-6 m-auto bg-white rounded-md lg:max-w-lg">
                <h2 className="lg:text-3xl md:text-2xl sm:text-xl xs:text-lg  font-semibold text-center text-black-700">
                User Information
                </h2>

                    <div className="mb-2">
                        <label htmlFor="name1" className="block text-sm font-semibold text-gray-800">
                        Firstname
                        </label>
                        <input
                        type="text"
                        id="name1"
                        className="block w-full px-4 py-2 mt-2 text-black-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="name2" className="block text-sm font-semibold text-gray-800">
                        Lastname
                        </label>
                        <input
                        type="text"
                        id="name2"
                        className="block w-full px-4 py-2 mt-2 text-black-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-800">
                        Phone Number
                        </label>
                        <input
                        type="texts"
                        id="phone"
                        className="block w-full px-4 py-2 mt-2 text-black-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                    <div className="mb-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                        Email
                        </label>
                        <input
                        type="email"
                        id="email"
                        className="block w-full px-4 py-2 mt-2 text-black-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                    </div>
                    <div className="mt-6">
                        <button
                        className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-slate-500 rounded-md hover:bg-slate-700 focus:outline-1 focus:bg-slate-800"
                        onClick={handleSubmit}>
                        Submit
                        </button>
                    </div>

            </div>
        </div>
    );
}