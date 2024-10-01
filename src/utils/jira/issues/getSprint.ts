const getSprint = (sprintField: string) => {
  let sprint: any = null;
  const sprintString = sprintField.match(/\[(.*?)\]/);
  if (sprintString !== null) {
    const sprintValues = sprintString[1].split(",");
    sprint = {}
    for (const sprintValue of sprintValues) {
      let [key, value] = sprintValue.split("=");
      if (key === "completeDate") {
        key = "completedDate";
      } 
      const updatedValue: string|null = value === "<null>" ? null : value;
      sprint[key] = updatedValue;
    }
  }
  return sprint;
};

export default getSprint;
