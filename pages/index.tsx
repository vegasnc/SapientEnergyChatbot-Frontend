import { useState, useRef } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';

import ChatBox from '@/components/ui/ChatBox';
import UserInfoPopup from '@/components/ui/UserInfoPopup';
import useModal from "@/hooks/useModal";
import UserInformationForm from '@/components/ui/UserInformationForm';

import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
import '@/node_modules/react-toastify/dist/ReactToastify.css';

export default function Home() {

  const { isOpen, toggle } = useModal();

  const [chatHistory, setChatHistory] = useState<{
    history: [string, string][];
  }>({
    history: []
  });

  const showToast = (message : string, type : string) => {
    if( type == "warning" ) {
      toast.warning(message, {position: toast.POSITION.BOTTOM_RIGHT});
    } else if ( type == "success" ) {
      toast.success(message, {position: toast.POSITION.BOTTOM_RIGHT});
    }
  }

  return (
    <>
      <Layout>

        <ToastContainer 
          position='top-right' 
          autoClose={5000} 
          hideProgressBar={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover/>
        
        <ChatBox chatHistory={setChatHistory} toggle={toggle} showToast={showToast}></ChatBox>

        <footer className="m-auto p-4">
          <a href="https://github.com/Mkneeshaw">
            Proprietary Demo built by MKneeshaw owned by Sapient Industries.
          </a>
        </footer>

        <UserInfoPopup isOpen={isOpen} toggle={toggle}>
          <UserInformationForm chatHistory={chatHistory.history} />
        </UserInfoPopup>
      </Layout>
    </>
  );
}
