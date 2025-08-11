import React, { useEffect } from "react";
import { IoChevronBackOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { changeTaskStatusAction, getSingleTaskDetailsAction } from "../store/action/userDataAction";

const SingleTaskScren = ({ onClose, selectedTask, task }) => {
    console.log('selectedTask', selectedTask, task)

    const { loading, data, error } = useSelector((state) => state.singleTaskDetails)
    const singleData = data?.data?.tasks?.[0];
console.log('singleData',singleData)
    const { data: dataa } = useSelector((state) => state.userData);
    const userDataList = dataa?.data || [];

    const dispatch = useDispatch();
    useEffect(() => {
        let taskId = task;
        dispatch(getSingleTaskDetailsAction(taskId))
    }, [])
    return (
        <>
            {loading ? (
                <div className="flex justify-center h-full w-full items-center mb-6">
                    <p>Loading...</p>
                </div>
            )
                :
                (
                    <div className="p-6 bg-gray-50 full-height-content">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <button onClick={onClose} className="flex items-center gap-2 text-gray-700">
                                <IoChevronBackOutline size={25} />
                                <span className="text-lg font-medium">Back</span>
                            </button>
                        </div>

                        {/* Task Header */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h1 className="text-2xl font-bold mb-4">{singleData?.name}</h1>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                <div>
                                    <p className="font-medium">Created Time</p>
                                    <p>{singleData?.start_date?.split(' ')[0]}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Status</p>
                                    <p className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                                        {singleData?.stage_name}
                                    </p>
                                    {userDataList?.role === 'Manager' ?
                                        <select
                                            className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800"
                                            onChange={(e) => {
                                                const id = task.id;
                                                const stage_name = e.target.value;
                                                dispatch(changeTaskStatusAction(id, stage_name));
                                            }}
                                        >
                                            <option className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-800">{data?.data?.[0]?.status}</option>
                                            {singleData?.stage_name === 'Created' ? <>
                                                <option value="Hold">Hold</option>
                                            </>
                                                :
                                                singleData?.stage_name === 'In Progress' ?
                                                    <>
                                                        <option value="Hold">Hold</option>
                                                    </>
                                                    :
                                                    singleData?.stage_name === 'Redo' ?
                                                        <>
                                                            <option value="Hold">Hold</option>
                                                            <option value="Completed">Completed</option>
                                                        </>
                                                        :
                                                        singleData?.stage_name === 'Running Late' ?
                                                            <>
                                                                <option value="Hold">Hold</option>
                                                                <option value="Completed">Completed</option>
                                                            </>
                                                            :
                                                            singleData?.stage_name === 'Review' ?
                                                                <>
                                                                    <option value="Redo">Redo</option>
                                                                    <option value="Completed">Completed</option>
                                                                </>
                                                                :
                                                                singleData?.stage_name === 'Completed' ?
                                                                    <>
                                                                        <option value="Hold">Hold</option>
                                                                    </>
                                                                    :
                                                                    singleData?.stage_name === 'Hold' ?
                                                                        <>
                                                                            <option value="Cancel">Cancel</option>
                                                                        </>
                                                                        :
                                                                        <option value="Hold">Hold</option>
                                            }
                                        </select>
                                        :
                                        <select
                                            onChange={(e) => {
                                                const id = task.id;
                                                const stage_name = e.target.value;
                                                dispatch(changeTaskStatusAction(id, stage_name));
                                            }}
                                        >
                                            <option>{singleData?.stage_name}</option>
                                            {singleData?.stage_name === 'Created' ? <>
                                                <option value="In Progress">Start Task</option>
                                            </>
                                                :
                                                singleData?.stage_name === 'In Progress' ?
                                                    <>
                                                        <option value="Review">Send Review</option>
                                                    </>
                                                    :
                                                    singleData?.stage_name === 'Redo' ?
                                                        <>
                                                            <option value="Created">Start Task</option>
                                                        </>
                                                        :
                                                        singleData?.stage_name === 'Running Late' ?
                                                            <>
                                                                <option value="Created">Start Task</option>
                                                                <option value="Review">Send Review</option>
                                                            </>
                                                            :
                                                            singleData?.stage_name === 'Cancel' ?
                                                                <>
                                                                    <option value="Created">Start Task</option>
                                                                </>
                                                                :
                                                                singleData?.stage_name === 'Hold' ?
                                                                    <>
                                                                        <option value="Created">Start Task</option>
                                                                        <option value="Cancel">Cancel</option>
                                                                    </>
                                                                    :
                                                                    singleData?.stage_name === 'Review' ? '' : ''
                                            }
                                        </select>}
                                </div>
                                <div>
                                    <p className="font-medium">Priority</p>
                                    <p className="text-blue-500">{singleData?.priority[0].toUpperCase()}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Due Date</p>
                                    <p>{singleData?.deadline_date?.split(' ')[0]}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="font-medium">Tags</p>
                                    <div className="flex gap-2">
                                        {["Task", "Wireframe", "Homepage"].map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-600"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <p className="font-medium">Assignees</p>
                                    <div className="flex -space-x-2">
                                        {singleData?.assignees_emails?.map((initial, idx) => {
                                            console.log('singleData', singleData)
                                            const nameParts = initial?.name?.split(" ");
                                            const initials =
                                                nameParts[0]?.charAt(0) + (nameParts[1]?.charAt(0) || "");
                                            return (
                                                <div
                                                    key={idx}
                                                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-white font-bold"
                                                >
                                                    {initials.toUpperCase()}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-6">
                                <p className="font-medium">Project Description</p>
                                <p className="text-gray-600 text-sm mt-1">
                                    {singleData?.project_description}
                                </p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="mt-8">
                            <div className="flex gap-6 border-b pb-2">
                                {["Activity", "My Work", "Assigned", "Comments"].map((tab, idx) => (
                                    <button
                                        key={idx}
                                        className={`pb-2 ${idx === 0
                                            ? "border-b-2 border-indigo-500 text-indigo-500"
                                            : "text-gray-600"
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            {/* Activity Feed */}
                            <div className="mt-6 space-y-4">
                                <div className="text-sm">
                                    <p>
                                        <span className="font-medium">Talan Korsgaard</span> changed the
                                        status of <span className="font-medium">"Design Homepage Wireframe"</span> from{" "}
                                        <span className="italic">To Do</span> to{" "}
                                        <span className="italic">In Progress</span>
                                    </p>
                                    <p className="text-gray-400 text-xs">10:45 AM</p>
                                </div>
                                <div className="text-sm">
                                    <p>
                                        <span className="font-medium">Hanna Philips</span> added reaction 🚀 in{" "}
                                        <span className="font-medium">Design Homepage Wireframe</span>
                                    </p>
                                    <p className="text-gray-400 text-xs">10:20 AM</p>
                                </div>
                                <div className="text-sm">
                                    <p>
                                        <span className="font-medium">Talan Korsgaard</span> added a comment in{" "}
                                        <span className="font-medium">Design Homepage Wireframe</span>
                                    </p>
                                    <p className="text-gray-400 text-xs">10:45 AM</p>
                                </div>
                                <div className="text-sm">
                                    <p>
                                        <span className="font-medium">Davis Donin</span> uploaded file{" "}
                                        <span className="font-medium">User Flow</span>
                                    </p>
                                    <a
                                        href="#"
                                        className="inline-block text-blue-500 underline text-xs mt-1"
                                    >
                                        Download User Flow (2.35 MB)
                                    </a>
                                    <p className="text-gray-400 text-xs">10:45 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default SingleTaskScren;
