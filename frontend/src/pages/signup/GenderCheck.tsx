import { UserSignUp } from "../../models/UserSignUp";

interface GenderCheckProps {
  value: UserSignUp;
  setInputs: React.Dispatch<React.SetStateAction<UserSignUp>>;
}

const GenderCheck: React.FC<GenderCheckProps> = ({ value, setInputs }) => {
  const handleInputChange = (newValue: string) => {
    if (newValue === "male" || newValue === "female")
      setInputs({ ...value, gender: newValue });
  };

  return (
    <div className="flex">
      <div className="form-control">
        <label className={`label gap-2 cursor-pointer`}>
          <span className="label-text">Male</span>
          <input
            type="checkbox"
            className="checkbox border-slate-300"
            checked={value.gender === "male"}
            onChange={() => handleInputChange("male")}
          />
        </label>
      </div>
      <div className="form-control">
        <label className={`label gap-2 cursor-pointer`}>
          <span className="label-text">Female</span>
          <input
            type="checkbox"
            className="checkbox border-slate-300"
            checked={value.gender === "female"}
            onChange={() => handleInputChange("female")}
          />
        </label>
      </div>
    </div>
  );
};

export default GenderCheck;
