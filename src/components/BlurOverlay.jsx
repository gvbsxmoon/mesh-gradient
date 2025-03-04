import styled from "styled-components";
import { useControls } from "leva";

/**
 * this should be converted in shader
 */

const $BlurOverylay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: blur(${(props) => props.strenght}px);
    pointer-events: none;
`;

export default function () {
    const { showBlur, strenght } = useControls("Blur Effect", {
        showBlur: false,
        strenght: {
            value: 2,
            min: 0,
            max: 64,
            step: 1,
        },
    });

    return <>{showBlur && <$BlurOverylay strenght={strenght} />}</>;
}
