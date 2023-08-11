export function CommentSolid(props: { height: string; width: string; className: string }) {
    return (
        <>
            <svg {...props}>
                <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="Icon-Set-Filled" transform="translate(-102.000000, -257.000000)" fill="#000000">
                        <path
                            d="M118,257 C109.164,257 102,263.269 102,271 C102,275.419 104.345,279.354 108,281.919 L108,289 L115.009,284.747 C115.979,284.907 116.977,285 118,285 C126.836,285 134,278.732 134,271 C134,263.269 126.836,257 118,257"
                            id="comment-1"
                        ></path>
                    </g>
                </g>
            </svg>
        </>
    );
}

export function Close(props: { height: string; width: string; className: string }) {
    return (
        <>
            <svg {...props}>
                <path
                    d="M3 21.32L21 3.32001"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M3 3.32001L21 21.32"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </>
    );
}
