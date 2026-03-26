import {
  createWorkspaceProcedure,
  getWorkspacesProcedure,
  deleteWorkspaceProcedure,
  updateWorkspaceProcedure,
} from '../procedures/user/workspace'
import { createTRPCRouter } from '../trpc'

const workspaceRouter = createTRPCRouter({
  createWorkspace: createWorkspaceProcedure,
  getWorkspaces: getWorkspacesProcedure,
  deleteWorkspace: deleteWorkspaceProcedure,
  updateWorkspace: updateWorkspaceProcedure,
})

export default workspaceRouter
