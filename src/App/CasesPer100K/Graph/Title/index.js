import React, { useCallback } from "react";
import Slider from '@material-ui/core/Slider';

import styles from "./index.module.scss";

const Title = ({
    children,
    slider = false,
    sliderMax,
    domainMax,
    setDomainMax,
}) => {
  const handleChange = useCallback(
      (e, v) => setDomainMax(v),
      [setDomainMax]
  );

  return (
    <div className={styles.Title}>
        <h1 className={styles.Header}>{children}</h1>
        {slider && (
            <Slider
                marks={true}
                step={1000}
                value={domainMax}
                onChange={handleChange}
                min={1000}
                max={sliderMax}
                aria-labelledby="continuous-slider"
            />
        )}
    </div>
  );
};

export default Title;
