import { useRef, useState, useEffect, Dispatch, SetStateAction } from 'react';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis,
         PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Close, CommentSolid } from '@/utils/icons';

interface VisObj {
    propertyID: string;
    value: number;
}
const visObjList: VisObj[] = [];
const TEXT_FORMAT = "1";
const TEXT_TABLE_FORMAT = "2";
const TEXT_PIECHART_FORMAT = "3";
const TEXT_BARCHART_FORMAT = "4";
const STATIC_ANSWER = "1"
const GENERAL_ANSWER = "2"
const API_ANSWER = "3"
const API_DROPDOWN_END_USE = "end_use";
const API_DROPDOWN_EQUIPMENT  = "equipment";
const API_DROPDOWN_EQUIPMENT_TYPE = "equipment_type";
const API_DROPDOWN_SPACE_TYPE = "space_type";
const API_DROPDOWN_CIRCUIT = "circuit_type";
const API_DROPDOWN_BUILDING = "building";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
      border: 0
    },
  },
};
const UID = Math.random().toString(36).substring(2, 9);

interface PropsType {
    chatHistory: Dispatch<SetStateAction<{ history: [string, string][] }>>;
    toggle: () => void;
    // showToast: (message: string, type: string) => void;
}

const StartMSG = [
    "Your energy usage is constantly changing. Would you like to learn more about those trends?",

    "New data has been recorded for your building. What would you like to learn about today?",
    
    "It's good to see you again! How can I help you today?",
    
    "Hello! I'm your Energy Helper. How can I help you analyze your energy data?",
    
    "Welcome to the Energy Metering Solution Chatbot! 📊 Ready to take control of your energy usage and costs? I'm here to guide you through our cutting-edge metering technology and help you make informed decisions. How can I assist you today?",
    
    "With data that evolves constantly and new energy trends emerging, we're here to help you stay ahead. How can I assist you today?",
    
    "In a world of ever-changing energy data and emerging trends, we're here to keep you informed and in control. How can I assist you today?",
    
    "As energy data evolves continuously and new trends emerge, we're here to empower you. How can I help you today?",
    
    "In a landscape of ever-changing energy data and emerging trends, we're here to be your resource. How can I facilitate your needs today?"
]

export default function ChatBox(props: PropsType) {
    const [query, setQuery] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [apiArr, setAPIArr] = useState<Array<{api: string; response: string; format: string; title: string; dropdown: string}>>([]);
    const [messageState, setMessageState] = useState<{
        messages: Message[];
        pending?: string;
        history: [string, string][];
    }>({
        messages: [
            {
                message: StartMSG[Math.floor(Math.random() * 9)],
                type: 'apiMessage',
                data: [],
                format: TEXT_FORMAT
            },
        ],
        history: [],
    });
    const [ isOpenPopup, setOpenPopup ] = useState(false);
    const [ dropdownCategory, setDropdown ] = useState("");
    const [ dropdownValue, setDropdownValue ] = useState("");
    const [ dropdownTitle, setDropdownTitle ] = useState("");
    const [ dropdownValueArray, setDropdownValueArray ] = useState<Array<{id: string, name: string}>>([]);
    const { messages, history } = messageState;
    const [additionalComments, setAdditionalComments] = useState("");

    const DateNow = new Date();
    const [ startDate, setStartDate ] = useState(dayjs(DateNow.getFullYear() + "-" + DateNow.getMonth() + "-" + DateNow.getDate()));
    const [ endDate, setEndDate ] = useState(dayjs(new Date()));
    const [ myDataRate, setMyDataRate ] = useState(0);
    const [ myAbilityRate, setMyAbilityRate ] = useState(0);
    const [ senderEmail, setSenderEmail ] = useState("");
    const [ EndUseArray, setEndUseArray ] = useState<Array<{id: string, name: string}>>([]);
    const [ EquipmentArray, setEquipmentArray ] = useState<Array<{id: string, name: string}>>([]);
    const [ BuildingArray, setBuildingArray ] = useState<Array<{id: string, name: string}>>([]);
    const [ EquipmentTypeArray, setEquipmentTypeArray ] = useState<Array<{id: string, name: string}>>([]);
    const [ savedAPI, setSavedAPI ] = useState("");
    const [ savedQuestion, setSavedQuestion ] = useState("");
    const [ savedFormat, setSavedFormat ] = useState("");
    const [ savedDropdownCategory, setSavedDropdownCategory ] = useState("");
    const [ buildingInfo, setBuildingInfo ] = useState<{id: string, name: string}>({id: "", name: ""});

    const messageListRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const backendAPI = axios.create({
        baseURL: "https://sback.kneeshaw-developments.com"
        // baseURL : "http://localhost:5000"
    });
    backendAPI.defaults.headers.common['Content-Type'] = 'application/json';
    backendAPI.defaults.headers.common['User-Agent'] = 'XY';
    
    useEffect(() => {
        textAreaRef.current?.focus();
    }, []);

    useEffect(() => {
        messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
    }, [messageState.messages]);

    useEffect(() => {
        textAreaRef.current?.focus();
        if( isOpenPopup == true )
            getPrePopulatedData()
    }, [isOpenPopup]);

    useEffect(() => {
        const title = dropdownCategory === API_DROPDOWN_END_USE
                    ? "Which end use?"
                    : dropdownCategory === API_DROPDOWN_EQUIPMENT
                    ? "Which equipment?"
                    : dropdownCategory === API_DROPDOWN_EQUIPMENT_TYPE
                    ? "Which equipment type?"
                    : dropdownCategory === API_DROPDOWN_SPACE_TYPE
                    ? "Which space type?"
                    : dropdownCategory === API_DROPDOWN_CIRCUIT
                    ? "Which circuit?"
                    : dropdownCategory === API_DROPDOWN_BUILDING
                    ? "Which building?"
                    : "";
        setDropdownTitle(title);
        if( dropdownCategory === API_DROPDOWN_END_USE ) {
            setDropdownValueArray(EndUseArray);
        } else if( dropdownCategory === API_DROPDOWN_EQUIPMENT ) {
            setDropdownValueArray(EquipmentArray);
        } else if( dropdownCategory === API_DROPDOWN_EQUIPMENT_TYPE ) {
            setDropdownValueArray(EquipmentTypeArray);
        } else if( dropdownCategory === API_DROPDOWN_SPACE_TYPE ) {
            setDropdownValueArray([]);
        } else if( dropdownCategory === API_DROPDOWN_CIRCUIT ) {
            setDropdownValueArray([]);
        } else if( dropdownCategory === API_DROPDOWN_BUILDING ) {
            setDropdownValueArray(BuildingArray);
        }
    }, [dropdownCategory]);


    const clearHistory = () => {
        // setQuery("");
        // setLoading(false);
        // setError(null);
        // setMessageState({
        //   messages: [
        //     {
        //       message: 'Hello, are you looking to buy or sell today?',
        //       type: 'apiMessage',
        //     },
        //   ],
        //   history: [],
        // });
    };

    // chat box open button action
    const triggerPopup = () => {
        clearHistory();
        return (
            <button className={styles.btnchatbox}>
                {isOpenPopup ? (
                    <Close height="35" width="35" className={styles.btnchatboxicon} />
                ) : (
                    <CommentSolid height="35" width="35" className={styles.btnchatboxicon} />
                )}
            </button>
        );
    };

    const triggerFeedback = () => {
        return(
            <a className={styles.feedback}>Leave your feedback...</a>
        );
    };

    // Open popup
    const openedPopup = () => {
        setOpenPopup(true);
    };

    // Close popup
    const closedPopup = () => {
        setOpenPopup(false);
    };

    const clearSavedAPIData = () => {
        setSavedAPI("");
        setSavedFormat("");
        setSavedQuestion("");
        setDropdown("");
        setDropdownValue("");
        setBuildingInfo({id: "", name: ""});
    }

    const getPrePopulatedData = async () => {

        const response = await backendAPI.post( "/api/get_prepopulated_data", {});
        const populatedData = await response.data;
        let tempArray: Array<{id: string, name: string}> = [];

        if( populatedData.building_data != null ) {
            populatedData.building_data.map((item: any) => {
                tempArray.push({"id": item.building_id, "name": item.building_name})
            })
            setBuildingArray(tempArray);
        }

        tempArray = [];
        if( populatedData.equip_type != null ) {
            populatedData.equip_type.map((item: any) => {
                tempArray.push({"id": item.equipment_id, "name": item.equipment_type});
            });
            setEquipmentTypeArray(tempArray);
        }

        tempArray = [];
        if( populatedData.end_use != null ) {
            populatedData.end_use.map((item: any) => {
                tempArray.push({"id": item.end_user_id, "name": item.name});
            })
            setEndUseArray(tempArray)
        }
    }

    async function getAPIAnswer(api: string, format: string, title: string, dropdown: string, type: string) {
        const question = title.trim();
        if( type != API_ANSWER )
            setMessageState((state) => ({
                ...state,
                messages: [
                    ...state.messages,
                    {
                        type: 'userMessage',
                        message: question,
                        data: [],
                        format: TEXT_FORMAT,
                    },
                ],
            }));
        
        setAPIArr([]);

        if( buildingInfo?.id == "" || buildingInfo?.name == "" ) {
            setDropdown(API_DROPDOWN_BUILDING);
            setSavedDropdownCategory(dropdown);
            setSavedAPI(api);
            setSavedQuestion(question);
            setSavedFormat(format);
            messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
        } else {
            setDropdown(dropdown);
    
            clearSavedAPIData();
            setLoading(true);
    
            try {
                const stDate = startDate.get("year") + "-" + (startDate.get("month") + 1) + "-" + startDate.get("date");
                const enDate = endDate.get("year") + "-" + (endDate.get("month") + 1) + "-" + endDate.get("date");
    
                const response = await backendAPI.post( "/api/get_api_answer", {
                    question: question,
                    api: api,
                    format: format,
                    type_id: "",
                    type_name: "",
                    stDate: stDate,
                    enDate: enDate,
                });
                const data = await response.data;
    
                if (data.error || response.status != 200) {
                    setTroubleshootMessage(question);
                } else {
                    setMessageState((state) => ({
                        ...state,
                        messages: [
                            ...state.messages,
                            {
                                type: 'apiMessage',
                                message: data.answer,
                                data: data.ref_data,
                                format: format,
                            },
                        ],
                        history: [...state.history, [question, data.answer]],
                    }));
    
                    props.chatHistory(messageState);
                }
    
                setLoading(false);
    
                //scroll to bottom
                messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
            } catch (error) {
                setLoading(false);
                setTroubleshootMessage(question);
                console.log('error', error);
            }
        }
    }

    const setTroubleshootMessage = (question: string) => {
        clearSavedAPIData();
        setMessageState((state) => ({
            ...state,
            messages: [
                ...state.messages,
                {
                    type: 'apiMessage',
                    message: "I'm having trouble connecting with your energy data, Please try again later.",
                    data: [],
                    format: TEXT_FORMAT,
                },
            ],
            history: [...state.history, [question, "I'm having trouble connecting with your energy data, Please try again later."]],
        }));
    }

    //handle form submission
    async function handleSubmit(e: any) {
        e.preventDefault();
        clearSavedAPIData();

        setError(null);

        if (!query) {
            // props.showToast("Please fill out the content", "warning");
            alert("Please fill out the content");
            return "Notify!";
        }

        const question = query.trim();

        setMessageState((state) => ({
            ...state,
            messages: [
                ...state.messages,
                {
                    type: 'userMessage',
                    message: question,
                    data: [],
                    format: TEXT_FORMAT,
                },
            ],
        }));

        setLoading(true);
        setQuery('');

        try {
            const stDate = startDate.get("year") + "-" + (startDate.get("month") + 1) + "-" + startDate.get("date");
            const enDate = endDate.get("year") + "-" + (endDate.get("month") + 1) + "-" + endDate.get("date");
            
            const response = await backendAPI.post( "/api/get_answer", {
                question: question,
                stDate: stDate,
                enDate: enDate,
            });
            const data = await response.data;

            if (data.error || response.status != 200) {
                setTroubleshootMessage(question);
            } else {
                // if the question is calling the API or functional button directly, answer is empty and call getAPIAnswer directly 
                if( data.answer.type !== undefined ) {
                    if( data.answer.type == STATIC_ANSWER || data.answer.type == GENERAL_ANSWER ) {
                        setMessageState((state) => ({
                            ...state,
                            messages: [
                                ...state.messages,
                                {
                                    type: 'apiMessage',
                                    message: data.answer.answer,
                                    data: [],
                                    format: TEXT_FORMAT,
                                },
                            ],
                            history: [...state.history, [question, data.answer.answer]],
                        }));
        
                        props.chatHistory(messageState);
        
                        setAPIArr(data.answer.api);
                    } else if( data.answer.type == API_ANSWER ) {
                        const api = data.answer.api
                        const dropdown = data.answer.dropdown
                        const question = data.answer.question
                        getAPIAnswer(api, "0", question, dropdown, API_ANSWER)
                    }
                } else {
                    setMessageState((state) => ({
                        ...state,
                        messages: [
                            ...state.messages,
                            {
                                type: 'apiMessage',
                                message: data.answer.answer,
                                data: [],
                                format: TEXT_FORMAT,
                            },
                        ],
                        history: [...state.history, [question, data.answer.answer]],
                    }));
                }

            }
            console.log('messageState', messageState);

            setLoading(false);

            //scroll to bottom
            messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
        } catch (error) {
            setLoading(false);
            setTroubleshootMessage(question);
            console.log('error', error);
        }
    }

    //prevent empty submissions
    const handleEnter = (e: any) => {
        if (e.key === 'Enter' && query) {
            handleSubmit(e);
        } else if (e.key == 'Enter') {
            e.preventDefault();
        }
    };

    const handleFeedback = async (e: any) => {
        e.preventDefault();

        if( senderEmail == "" ) {
            // props.showToast("Please fill out your email", "warning");
            alert("Please fill out your email");
            // toast.warning("Please fill out your email", {position: toast.POSITION.BOTTOM_RIGHT});
            return "Notify!";
        }

        let messageHistory = "";
        messages.map((message) => {
            if( message.type == 'apiMessage' )
                messageHistory += "AI : " + message.message + "\n\n";
            else if( message.type == 'userMessage' )
                messageHistory += "User : " + message.message + "\n\n";
        })

        const response = await backendAPI.post( "/api/send_feedback", {
            feedback: additionalComments,
            history: messageHistory,
            rate_my_data: myDataRate,
            rate_my_ability: myAbilityRate,
            email: senderEmail
        });
        const data = await response.data;
        if( data.result == "success" ) {
            // toast.success("Thanks. Successfully sent!", {position: toast.POSITION.BOTTOM_RIGHT});
            // props.showToast("Thanks. Successfully sent!", "success");
            alert("Thanks. Successfully sent!");
        } else {
            // toast.warning("Sorry, Please try again later", {position: toast.POSITION.BOTTOM_RIGHT});
            // props.showToast("Sorry, Please try again later", "warning");
            alert("Sorry, Please try again later");
        }
    };

    const clickRateMyData = (rate: number) => {
        setMyDataRate(rate);
    };

    const clickRateMyAnswer = (rate: number) => {
        setMyAbilityRate(rate);
    };

    const handleAdditionalComments = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAdditionalComments(e.target.value);
    }

    const handleSenderEmail = (e: any) => {
        setSenderEmail(e.target.value)
    }

    const handleDropdown = async (event: SelectChangeEvent, dropdown_title: string) => {
        const selectedData = dropdownValueArray[parseInt(event.target.value as string)];
        let building_id = "", building_name = "";
        // if it is building information selection dropdown, re-display dropdown
        if( buildingInfo?.id == "" || buildingInfo?.name == "") {
            setBuildingInfo({"id" : selectedData.id, "name" : selectedData.name});
            building_id = selectedData.id;
            building_name = selectedData.name;
            setDropdownValue(selectedData.name);
            setMessageState((state) => ({
                ...state,
                messages: [
                    ...state.messages,
                    {
                        type: 'apiMessage',
                        message: dropdown_title,
                        data: [],
                        format: TEXT_FORMAT,
                    },
                    {
                        type: 'userMessage',
                        message: selectedData.name,
                        data: [],
                        format: TEXT_FORMAT,
                    }
                ],
            }));

            if( savedDropdownCategory != "" ) {
                setDropdown(savedDropdownCategory);
                return ;
            }
        } else {
            building_id = buildingInfo?.id;
            building_name = buildingInfo?.name;
            setDropdownValue(selectedData.name);
            setMessageState((state) => ({
                ...state,
                messages: [
                    ...state.messages,
                    {
                        type: 'apiMessage',
                        message: dropdown_title,
                        data: [],
                        format: TEXT_FORMAT,
                    },
                    {
                        type: 'userMessage',
                        message: selectedData.name,
                        data: [],
                        format: TEXT_FORMAT,
                    }
                ],
            }));
        }
        setDropdown("");
        setLoading(true);
        
        // savedAPI
        const stDate = startDate.get("year") + "-" + (startDate.get("month") + 1) + "-" + startDate.get("date");
        const enDate = endDate.get("year") + "-" + (endDate.get("month") + 1) + "-" + endDate.get("date");

        
        try {
            const response = await backendAPI.post( "/api/get_api_answer", {
                question: savedQuestion,
                api: savedAPI,
                format: savedFormat,
                building_id: building_id,
                building_name: building_name,
                type_id: selectedData.id,
                type_name: selectedData.name,
                stDate: stDate,
                enDate: enDate,
            });
            const data = await response.data;

            if (data.error || response.status != 200) {
                setTroubleshootMessage(savedQuestion);
            } else {
                setMessageState((state) => ({
                    ...state,
                    messages: [
                        ...state.messages,
                        {
                            type: 'apiMessage',
                            message: data.answer,
                            data: data.ref_data,
                            format: savedFormat,
                        },
                    ],
                    history: [...state.history, [savedQuestion, data.answer]],
                }));
    
                props.chatHistory(messageState);
            }
    
            setLoading(false);
    
            //scroll to bottom
            messageListRef.current?.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
    
            clearSavedAPIData();
        } catch (error) {
            setLoading(false);
            setTroubleshootMessage(savedQuestion);
            console.log('error', error);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '50px',
                right: '50px',
            }}
        >
            <Popup
                trigger={triggerPopup}
                position="left bottom"
                closeOnDocumentClick={false}
                closeOnEscape={true}
                repositionOnResize={true}
                arrow={false}
                contentStyle={{ maxWidth: '600px', width: '70vw', padding: '0px', borderRadius: "0.5rem" }}
                onOpen={openedPopup}
                onClose={closedPopup}
            >
                <div className="mx-auto flex flex-col gap-4">
                    <div className={styles.chatheader}>
                        <div className={styles.datepickerPanel}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker 
                                    slotProps={{ textField: { size: 'small' } }} 
                                    label="Start Date" 
                                    defaultValue={startDate} 
                                    sx={{ '& input': {color: 'white'}, '& label': {color: 'white'}, '& button': {color: 'white'} }}
                                    className={styles.startdatepicker}
                                    onChange={date => setStartDate(dayjs(date))}
                                />
                                <DatePicker 
                                    slotProps={{ textField: { size: 'small' } }} 
                                    label="End Date" 
                                    defaultValue={endDate} 
                                    sx={{ '& input': {color: 'white'}, '& label': {color: 'white'}, '& button': {color: 'white'} }} 
                                    className={styles.enddatepicker}
                                    onChange={date => setEndDate(dayjs(date))}
                                />
                            </LocalizationProvider>
                        </div>
                    </div>
                    <div ref={messageListRef} className={styles.messagelist}>
                        {messages.map((message, index) => {
                            let icon;
                            let graph;
                            let dropdown;
                            let className;
                            if( message.type === 'apiMessage' ) {
                                icon = (
                                    <Image
                                        key={index}
                                        src="/bot-image.png"
                                        alt="AI"
                                        width="25"
                                        height="25"
                                        className={styles.boticon}
                                        priority
                                    />
                                );
                                className = styles.apimessage;
                            } else {
                                icon = (
                                    <Image
                                        key={index}
                                        src="/usericon.png"
                                        alt="Me"
                                        width="20"
                                        height="20"
                                        className={styles.usericon}
                                        priority
                                    />
                                );
                                // The latest message sent by the user will be animated while waiting for a response
                                className =
                                    loading && index === messages.length - 1
                                        ? styles.usermessagewaiting
                                        : styles.usermessage;
                            }

                            return (
                                <>
                                    <div key={`chatMessage-${index}`} className={className}>
                                        <div className={styles.markdownanswer}>
                                            <div dangerouslySetInnerHTML={{ __html: message.message }} />
                                        </div>
                                    </div>
                                    { dropdown }
                                </>
                            );
                        })}

                        {dropdownCategory !== "" && (
                            <div className={styles.apimessage}>
                                <FormControl sx={{ m: 1, width: "250px" }} variant="standard" fullWidth>
                                    <InputLabel id="label_category">
                                    { dropdownTitle }
                                    </InputLabel>
                                    <Select
                                        labelId="label_category"
                                        id="select_category"
                                        value={ dropdownValue }
                                        label={ dropdownTitle }
                                        onChange={(e) => handleDropdown(e, dropdownTitle)}
                                        MenuProps={MenuProps}
                                        autoWidth
                                    >
                                        {
                                            dropdownValueArray.map((value, i) => <MenuItem value={i}  key={i}>{value.name}</MenuItem>)
                                        }
                                    </Select>
                                </FormControl>
                            </div>
                        )}

                        {
                            !loading && apiArr && apiArr.length > 0 && apiArr.map((api_item, index) =>
                                    <>
                                        <div className={styles.apibutton} onClick={() => getAPIAnswer(api_item.api, api_item.format, api_item.title != "" ? `${api_item.title}` : `${api_item.response}`, api_item.dropdown, GENERAL_ANSWER)}>
                                            {api_item.title != "" ? `${api_item.title}` : `${api_item.response}`}
                                        </div>
                                    </>
                            )
                        }
                    </div>

                    {loading ? (
                        <div className={styles.loadingdiv}>
                            <span className={styles.loadingtext}>Generating...</span>
                        </div>
                    ) : (
                        <div>
                            {error ? (
                                <div className="border border-red-400 rounded-md p-4 m-1">
                                    <p className="text-red-500">{error}</p>
                                </div>
                            ) : (
                                <div className='w-full text-center'>
                                    <form className={styles.typingform} onSubmit={handleSubmit}>
                                        <div className={styles.typingdiv}>
                                            <textarea
                                                disabled={loading}
                                                className={styles.typingbox}
                                                rows={1}
                                                onKeyDown={handleEnter}
                                                ref={textAreaRef}
                                                autoFocus={false}
                                                id="userInput"
                                                name="userInput"
                                                placeholder={loading ? 'Waiting for response...' : 'Ask me anything...'}
                                                value={query}
                                                onChange={(e) => setQuery(e.target.value)}
                                            />
                                        </div>
                                        <button className={styles.btnsend} type="submit" disabled={loading}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="30"
                                                height="30"
                                                viewBox="0 0 30 30"
                                                fill="none"
                                            >
                                                <path
                                                    d="M7.60304 14.4388L13.9405 14.43M11.6869 5.56489L21.6924 10.5677C26.1826 12.8127 26.1737 16.4809 21.6924 18.7348L11.6869 23.7375C4.96053 27.1051 2.20281 24.3474 5.57041 17.6211L7.05533 14.6512L5.57041 11.6814C2.20281 4.95501 4.95169 2.20614 11.6869 5.56489Z"
                                                    stroke="white"
                                                    strokeWidth="2.10714"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </form>
                                    <Popup
                                        trigger={triggerFeedback}
                                        position="top center"
                                        closeOnDocumentClick={true}
                                        closeOnEscape={true}
                                        repositionOnResize={true}
                                        arrow={false}
                                        contentStyle={{ maxWidth: '560px', width: '70vw', padding: '0px', margin:'auto' }}
                                    >
                                        <form onSubmit={handleFeedback} className={styles.feedbackFrom}>
                                            <div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Enter your email" 
                                                    value={senderEmail} 
                                                    onChange={handleSenderEmail}/>
                                                <div>Rate My Data: </div>
                                                <div className='flex item-center'>
                                                    <Image
                                                        src="/rate_1.png"
                                                        alt="AI"
                                                        width="25"
                                                        height="25"
                                                        className={myDataRate == 0 ? styles.emoticactive : styles.emotic}
                                                        onClick={() => clickRateMyData(0)}
                                                        priority
                                                    />
                                                    <Image
                                                        src="/rate_2.png"
                                                        alt="AI"
                                                        width="25"
                                                        height="25"
                                                        className={myDataRate == 1 ? styles.emoticactive : styles.emotic}
                                                        onClick={() => clickRateMyData(1)}
                                                        priority
                                                    />
                                                    <Image
                                                        src="/rate_3.png"
                                                        alt="AI"
                                                        width="25"
                                                        height="25"
                                                        className={myDataRate == 2 ? styles.emoticactive : styles.emotic}
                                                        onClick={() => clickRateMyData(2)}
                                                        priority
                                                    />
                                                    <Image
                                                        src="/rate_4.png"
                                                        alt="AI"
                                                        width="25"
                                                        height="25"
                                                        className={myDataRate == 3 ? styles.emoticactive : styles.emotic}
                                                        onClick={() => clickRateMyData(3)}
                                                        priority
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div>Rate my ability to answer: </div>
                                                <div className='flex item-center'>
                                                    <Image
                                                        src="/rate_1.png"
                                                        alt="AI"
                                                        width="25"
                                                        height="25"
                                                        className={myAbilityRate == 0 ? styles.emoticactive : styles.emotic}
                                                        onClick={() => clickRateMyAnswer(0)}
                                                        priority
                                                    />
                                                    <Image
                                                        src="/rate_2.png"
                                                        alt="AI"
                                                        width="25"
                                                        height="25"
                                                        className={myAbilityRate == 1 ? styles.emoticactive : styles.emotic}
                                                        onClick={() => clickRateMyAnswer(1)}
                                                        priority
                                                    />
                                                    <Image
                                                        src="/rate_3.png"
                                                        alt="AI"
                                                        width="25"
                                                        height="25"
                                                        className={myAbilityRate == 2 ? styles.emoticactive : styles.emotic}
                                                        onClick={() => clickRateMyAnswer(2)}
                                                        priority
                                                    />
                                                    <Image
                                                        src="/rate_4.png"
                                                        alt="AI"
                                                        width="25"
                                                        height="25"
                                                        className={myAbilityRate == 3 ? styles.emoticactive : styles.emotic}
                                                        onClick={() => clickRateMyAnswer(3)}
                                                        priority
                                                    />
                                                </div>
                                            </div>
                                            <textarea 
                                                id="subject" 
                                                name="message" 
                                                placeholder="Additional Comments" 
                                                style={{"height" : "200px"}} 
                                                value={additionalComments} 
                                                onChange={handleAdditionalComments}></textarea>

                                            <button className={styles.feedbackBtn}>Submit</button>
                                        </form>
                                    </Popup>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Popup>
        </div>
    );
}

