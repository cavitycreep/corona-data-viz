import React from "react";

import styles from "./index.module.scss";

const Sources = ({
    children,
}) => {
    return (
        <div className={styles.Sources}>
            {children}
        </div>
    );
};

export default Sources;
