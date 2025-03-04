import styled from "styled-components";
import Hero from "../assets/hero.svg";

const $StyledImage = styled.div`
    position: absolute;
    bottom: 12px;
    left: 50%;
    translate: -50%;
`;

export default function () {
    return (
        <$StyledImage>
            <img src={Hero} height={48} />
        </$StyledImage>
    );
}
