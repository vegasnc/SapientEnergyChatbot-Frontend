import React, { ReactNode } from 'react';
import styles from '@/styles/UserInfoPopup.module.css';

interface ModalType {
    children?: ReactNode;
    isOpen: boolean;
    toggle: () => void;
}

const UserInfoPopup = (props: ModalType) => {
    return (
        <>
            {props.isOpen && (
                <div className={styles?.modaloverlay}>
                    <div  className={styles?.modalbox}>
                        <div className={styles?.modalclose} onClick={props.toggle}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <path d="M0 0h24v24H0z" fill="none"/>
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </div>
                        {props.children}
                    </div>
                </div>
            )}
        </>
    );
};

export default UserInfoPopup;
