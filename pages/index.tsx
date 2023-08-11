import { useState, useRef } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/index.module.css';

import ChatBox from '@/components/ui/ChatBox';
import UserInfoPopup from '@/components/ui/UserInfoPopup';
import useModal from "@/hooks/useModal";
import UserInformationForm from '@/components/ui/UserInformationForm';

export default function Home() {

  const { isOpen, toggle } = useModal();

  const [chatHistory, setChatHistory] = useState<{
    history: [string, string][];
  }>({
    history: []
  });



  return (
    <>
      <Layout>
        
        <ChatBox chatHistory={setChatHistory} toggle={toggle}></ChatBox>

        <footer className="m-auto p-4">
          <a href="https://github.com/Mkneeshaw">
            Demo built by MKneeshaw for Real Labs.
          </a>
        </footer>

        <UserInfoPopup isOpen={isOpen} toggle={toggle}>
          <UserInformationForm chatHistory={chatHistory.history} />
        </UserInfoPopup>
      </Layout>
    </>
  );
}
