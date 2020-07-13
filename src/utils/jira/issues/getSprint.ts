import XRegExp from 'xregexp';

const getSprint = (sprintField: string) => {
  let sprint: any = null;
  // if (issue.sprint.length > 0) {
  //   const sprintField = issue.sprint[0];
  const sprintSearch = XRegExp.exec(
    sprintField,
    XRegExp('(?<=name\\=)(.*)(?=,startDate)'),
  );
  if (sprintSearch !== null) {
    const sprintName = sprintSearch[0];
    sprint = { name: sprintName };

    const numberSearch = XRegExp.exec(sprintName, XRegExp('(?<=Sprint )(.*)'));
    if (numberSearch !== null) {
      sprint['number'] = numberSearch[0];
    }

    const startSearch = XRegExp.exec(
      sprintField,
      XRegExp('(?<=startDate\\=)(.*)(?=,endDate)'),
    );
    if (startSearch !== null && startSearch[0] !== '<null>') {
      const startDate = startSearch[0];
      sprint['startDate'] = startDate;
    }
    const completedSearch = XRegExp.exec(
      sprintField,
      XRegExp('(?<=completeDate\\=)(.*)(?=,sequence)'),
    );
    if (completedSearch !== null && completedSearch[0] !== '<null>') {
      // console.log(completedSearch);
      const completedDate = completedSearch[0];
      sprint['completedDate'] = completedDate;
    }
  }
  return sprint;
};

export default getSprint;
